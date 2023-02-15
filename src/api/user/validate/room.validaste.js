const ArgumentError = require('../../../exception/ArgumentError');
const NotFoundError = require('../../../exception/NotFoundError');
const Room = require('../../../model/room.model');

const roomValidate = {
    validRoom: async (roomId) => {
        if (!room)
            throw new ArgumentError('room valid ==>');

        const room = await Room.findById(roomId);
        if (!room)
            throw new NotFoundError('room valid ==>');

        return room;
    }


}

module.exports = roomValidate;