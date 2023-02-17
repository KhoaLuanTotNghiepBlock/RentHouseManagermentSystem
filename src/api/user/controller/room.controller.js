const roomService = require('../service/room.service');

class RoomController {

    // [POST] bh/room/create-room
    async createRoomForRent(req, res, next) {
        try {
            const { userId } = req.auth;
            const { data } = await roomService.createRoom(userId, req.body);

            return res.status(200).json({
                errorCode: 200,
                messaage: 'create success',
                data
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RoomController();