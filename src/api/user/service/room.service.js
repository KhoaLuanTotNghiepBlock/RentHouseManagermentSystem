const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const Room = require('../../../model/room.model');
const roomValidate = require('../validate/room.validaste');
const serviceApartment = require('../service/service.service');
const validateAddress = require('../validate/address.validate');
const User = require('../../../model/user/user.model');
const NotFoundError = require('../../../exception/NotFoundError');
const rentalContract = require('../blockchain/deploy/BHRentalContract');
const { compare } = require('../../../utils/object.helper');
class RoomService {
    async createRoom(_id, roomInfo) {

        let room = await roomValidate.validCreateRoom(_id, roomInfo);
        const { amentilities, services, cityName, ditrictName, streetName,
            wardName, addressDetail } = roomInfo;

        const address = await validateAddress.validAddress({
            cityName, ditrictName, streetName, wardName, addressDetail,
        });

        if (!room)
            throw new MyError('room service ==> room underfine!');

        if (!address) throw new MyError("room service ==>  address invalid!");

        if (!amentilities || !services)
            throw new ArgumentError('room service ==> missing parameter');

        // set owner
        const userOwner = await User.getById(_id);
        if (!userOwner)
            throw new NotFoundError('room servce=> not found user');

        room.owner = userOwner._id;
        // //set unity
        room.amentilities = amentilities;

        room.address = {};
        room.address = address;
        await room.save();
        // // set sevrice 
        room.services = {};
        await serviceApartment.createRoomService(room._id, services);

        const roomTransaction = await rentalContract.setRoomForRent(room._id, userOwner.wallet.walletAddress, room.basePrice, room.deposit);
        return {
            data: {
                room, roomTransaction
            }
        }
    }

    async reOpenRoom(ownerId, roomInfo) {
        const user = await User.getById(ownerId);

        if (!roomInfo) throw new MyError('missing parameter => re-openRoom')
        const { roomId, basePrice, deposit, totalNbPeople, gender } = roomInfo;
        const room = await Room.findById(roomId);

        if (!compare(room.owner, user._id))
            throw new MyError('not you room');

        const data = await rentalContract.reOpenRoomForRent(
            room,
            user?.wallet?.walletAddress,
            basePrice,
            deposit
        );

        if (data) {
            room.basePrice = basePrice;
            room.deposit = deposit;
            room.totalNbPeople = totalNbPeople;
            room.gender = gender;
            await room.save();
        }
        return {
            room,
            data
        }
    }

    async getAllRoom(
        conditions = {},
        pagination,
        projection,
        populate = [],
        sort = {}) {
        const { key, owner } = conditions;
        const filter = {
            ...(key && { key }),
            ...(owner && { owner })
        };
        const { limit, page, skip } = pagination;
        delete filter.limit;
        delete filter.page;
        if (key) {
            const words = key.replace(/　/g, " ").replace(/、/g, ",").replace(/,/g, " ").split(" ");
            filter.$or = [
                { $and: words.map((word) => ({ textSearch: new RegExp(word.replace(/\W/g, "\\$&"), "i") })) },
            ];
        }
        const [items, total] = await Promise.all([
            Room.find(filter, projection)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(populate)
                .lean(),
            Room.countDocuments(filter),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getOneRoom(roomId) {
        const roomPineline = [
            {
                path: 'owner',
                select: '_id username email phone identity name avatar wallet'
            },
            {
                path: 'services',
                select: '-updatedAt'
            }
        ];
        const room = await Room.findById(roomId)
            .populate(roomPineline);

        if (!room) throw new MyError('room not found');
        return room;
    }

    async updateRoom(roomId, data) {
        const { status } = Room.findById(roomId).projection({ status: 1 });
        if (status === "already-rent") throw new MyError('the room is still rented, can not edit the information')
        return Room.findByIdAndUpdate(roomId, data, { new: true });
    }
}

module.exports = new RoomService();
