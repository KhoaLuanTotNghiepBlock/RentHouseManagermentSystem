const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const NotFoundError = require('../../../exception/NotFoundError');
const Unit = require('../../../model/service/unit.model');
const Room = require('../../../model/room.model');
const serviceValidate = require('../validate/service.validate');
const roomValidate = require('../validate/room.validaste');
const addressValidate = require('../validate/address.validate');
class ServiceApartmentService {

    async createUnit(unitInfo) {
        const unit = await serviceValidate.validateUnitInfo(unitInfo);

        if (!unit)
            throw new MyError('Unit underfine!');

        await unit.save();
        return {
            errorCode: 200,
            message: 'add unit success',
            data: { unit }
        }
    }

    async getAllUnit() {
        const units = await Unit.find();

        if (!units)
            throw new NotFoundError('Unit');
        return {
            errorCode: 200,
            message: 'success',
            data: { units }
        }
    }

    async createRoomService(roomId, services) {
        if (!roomId)
            throw new ArgumentError('room service ==>');

        await roomValidate.validRoom(roomId);

        for (const val of services) {
            const service = await serviceValidate.validateService(val);

            let [saveService, updateRoom] = await Promise.all([
                await service.save(),
                await Room.updateOne(
                    { roomId },
                    {
                        $push: {
                            services: service._id
                        }
                    }
                )
            ]);

            if (saveService.modifiedCount === 0) throw new MyError('save service fail!');
            if (updateRoom.modifiedCount === 0) throw new MyError('update room fail');
        }
    }


}

module.exports = new ServiceApartmentService();