const commonHelper = require('../../../utils/common.helper');
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

    // [GET] bh/room/
    async getAllRoom(req, res, next) {
        try {
            const conditions = {
                ...req.query
            };
            const sort = {
                createdAt: -1,
            };
            const projection = {};
            const populate = [
                {
                    path: 'owner',
                    select: 'username email phone identity name avatar'
                }
            ]

            const { items, total, page, limit, totalPages } = await roomService.getAllRoom(
                conditions,
                commonHelper.getPagination(req.query),
                projection,
                populate,
                sort,
            );
            return res.status(200).json({
                data: { items, total, page, limit, totalPages },
                message: "success",
                errorCode: 200
            });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = new RoomController();