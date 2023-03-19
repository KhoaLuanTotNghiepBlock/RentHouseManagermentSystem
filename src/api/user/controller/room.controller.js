const commonHelper = require('../../../utils/common.helper');
const contractService = require('../service/contract.service');
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
                    select: '_id username email phone identity name avatar'
                },
                {
                    path: 'services',
                    select: "-updateAt"
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

    // [GET] bh/room/:userId
    async getOwnerRoom(req, res, next) {
        try {
            const userId = req.params.userId;
            const conditions = {
                ...req.query,
                owner: userId
            };
            const sort = {
                createdAt: -1,
            };
            const projection = {};
            const populate = [
                {
                    path: 'owner',
                    select: '_id username email phone identity name avatar'
                },
                {
                    path: 'services',
                    select: "-updateAt"
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

    // [GET] bh/room/rented
    async getRentedRoom(req, res, next) {
        try {
            const { userId } = req.auth;
            const conditions = {
                ...req.query,
                renter: userId
            };
            const sort = { createdAt: -1 };
            const projection = {
                renter: 1,
                room: 1,
                lessor: 1,
                dateRent: 1
            };
            const populate = [
                {
                    path: 'renter',
                    select: '_id username email phone identity name avatar'
                },
                {
                    path: 'lessor',
                    select: '_id username email phone identity name avatar'
                },
                {
                    path: 'room',
                    select: '-updatedAt'
                }
            ]

            const { items, total, page, limit, totalPages } = await contractService.getAllRoomContract(
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