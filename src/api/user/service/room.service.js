const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const Room = require('../../../model/room.model');
const roomValidate = require('../validate/room.validaste');
const serviceApartment = require('../service/service.service');
const validateAddress = require('../validate/address.validate');
const User = require('../../../model/user/user.model');
const NotFoundError = require('../../../exception/NotFoundError');

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
        //set unity
        room.amentilities = amentilities;

        // save
        await room.save();

        // set sevrice 
        room.services = {};
        await serviceApartment.createRoomService(room._id, services);

        return {
            data: room
        }
    }
}

module.exports = new RoomService();
