const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const NotFoundError = require('../../../exception/NotFoundError');
const Apartment = require('../../../model/apartment.model');
const Room = require('../../../model/room.model');
const User = require('../../../model/user/user.model');
const commonHelper = require('../../../utils/common.helper');
const { apartmentValidate } = require('../validate/apartment.validation');

const roomValidate = {
    validRoom: async (roomId) => {
        if (!roomId)
            throw new ArgumentError('room valid ==>');

        const room = await Room.findById(roomId);
        if (!room)
            throw new NotFoundError('room valid ==>');

        return room;
    },

    validTypeRoom: (typeRoom) => {
        if (!typeRoom) { throw new MyError("valid type room ==> missing parameter"); }

        const type = ["DORMITORY", "ROOM_FOR_RENT", "ROOM_FOR_SHARE"];

        return type.includes(typeRoom);
    },

    validCreateRoom: async (userId, roomInfo) => {
        if (!roomInfo)
            throw new ArgumentError('validate create room =>');

        let { name, acreage, nbCurrentPeople, totalNbPeople, gender, deposit, description,
            floor, period, basePrice, roomAttachment, typeRoom } = roomInfo;

        if (!(name && gender && description && roomAttachment))
            throw new ArgumentError('validate room ==> ');

        const userOwner = await User.findById(userId);
        if (!userOwner)
            throw new NotFoundError('User not found!');

        if (!roomValidate.validTypeRoom(typeRoom))
            throw new MyError('Type room invalid');

        //validate number
        acreage = commonHelper.convertToNumber(acreage);
        nbCurrentPeople = commonHelper.convertToNumber(acreage);
        totalNbPeople = commonHelper.convertToNumber(acreage);
        deposit = commonHelper.convertToNumber(acreage);
        floor = commonHelper.convertToNumber(acreage);
        period = commonHelper.convertToNumber(acreage);
        basePrice = commonHelper.convertToNumber(acreage);

        if (nbCurrentPeople > totalNbPeople)
            throw new MyError('validate room => current people must be little than toltal number people!');

        if (!commonHelper.validateGender(gender))
            throw new MyError('validate room => gender invalid');

        const { url } = roomAttachment;
        if (url.lenght === 0)
            throw new MyError('validate room ==> image room empty');

        return new Room({
            name, acreage,
            nbCurrentPeople, totalNbPeople,
            gender, deposit, description,
            floor, period, basePrice,
            roomAttachment, typeRoom,
            enable: true
        });
    }

}

module.exports = roomValidate;