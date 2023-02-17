const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const Room = require('../../../model/room.model');
const roomValidate = require('../validate/room.validaste');
const serviceApartment = require('../service/service.service');
const { apartmentValidate } = require("../validate/apartment.validation");


class RoomService {
    async createRoom(_id, roomInfo) {

        let room = await roomValidate.validCreateRoom(_id, roomInfo);
        const { amentilities, services, cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail } = roomInfo;

        const address = await apartmentValidate.validAddress({
            cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail,
        });
        if (!room)
            throw new MyError('room service ==> room underfine!');

        if (!address) throw new MyError("room service ==>  address invalid!");

        if (!amentilities || !services)
            throw new ArgumentError('room service ==> missing parameter');

        //set unity
        room.amentilities = {};
        room.amentilities.isWifi = amentilities.isWifi;
        room.amentilities.isMezzanine = amentilities.isMezzanine;
        room.amentilities.isCamera = amentilities.isCamera;
        room.amentilities.isParking = amentilities.isParking;
        room.amentilities.isFrigde = amentilities.isFrigde;
        room.amentilities.isWashingMachine = amentilities.isWashingMachine;
        room.amentilities.isTelevision = amentilities.isTelevision;
        room.amentilities.isAirCoditional = amentilities.isAirCoditional;
        room.amentilities.isElevator = amentilities.isElevator;
        room.amentilities.isPool = amentilities.isPool;
        room.amentilities.isWardrobe = amentilities.isWardrobe;
        room.amentilities.isPet = amentilities.isPet;
        room.amentilities.isCooking = amentilities.isCooking;
        room.amentilities.isBed = amentilities.isBed;
        room.amentilities.isPrivateWC = amentilities.isPrivateWC;
        room.amentilities.isSecurity = amentilities.isSecurity;
        room.amentilities.isNoCurfew = amentilities.isNoCurfew;
        room.amentilities.isBalcony = amentilities.isBalcony;


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
