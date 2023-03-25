const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const Room = require('../../../model/room.model');
const roomValidate = require('../validate/room.validaste');
const serviceApartment = require('../service/service.service');
const validateAddress = require('../validate/address.validate');
const User = require('../../../model/user/user.model');
const NotFoundError = require('../../../exception/NotFoundError');
const rentalContract = require('../blockchain/deploy/BHRentalContract');
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
        // await rentalContract.setRoomForRent("641df3419b6935f136bb05e9", userOwner.wallet.walletAddress, 23000, 23000);
        return {
            data: {
                room, roomTransaction
            }
        }
    }

    async getAllRoom(
        conditions = {},
        pagination,
        projection,
        populate = [],
        sort = {}) {

        const filter = { ...conditions };
        const { limit, page, skip } = pagination;
        delete filter.limit;
        delete filter.page;

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

    async getOneRoom(conditions = {}, projection = {}) {
        const roomPineline = [
            {
                path: 'owner',
                select: 'username email phone identity name avatar wallet'
            },
            {
                path: 'services',
                select: '-updatedAt'
            }
        ];
        const room = await Room.findOne({ conditions })
            .populate(roomPineline)
            .projection();
        return room;
    }
}

module.exports = new RoomService();
