const ArgumentError = require('../../../exception/ArgumentError');
const MyError = require('../../../exception/MyError');
const NotFoundError = require('../../../exception/NotFoundError');
const Unit = require('../../../model/service/unit.model');
const Room = require('../../../model/room.model');
const Apartment = require('../../../model/apartment.model');
const serviceValidate = require('../validate/service.validate');
const roomValidate = require('../validate/room.validaste');
const { apartmentValidate } = require('../validate/apartment.validation');
const Service = require('../../../model/service/service.model');

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

        services = await serviceValidate.validateListService(services);

        for (const val of services) {
            let [saveService, updateRoom] = await Promise.all([
                await val.save(),
                awaitRoom.updateOne(
                    { roomId },
                    {
                        $push: {
                            service: val._id
                        }
                    }
                )
            ]);

            if (saveService.modifiedCount === 0) throw new MyError('save service fail!');
            if (updateRoom.modifiedCount === 0) throw new MyError('update room fail');
        }
    }

    async createApartmentService(apartmentId, services) {
        if (!apartmentId)
            throw new ArgumentError('apartment service ==>');

        await apartmentValidate.validApartment(apartmentId);
        for (const val of services) {
            const service = await serviceValidate.validateService(val);

            let [saveService, updateApartment] = await Promise.all([
                await service.save(),
                await Apartment.updateOne(
                    { apartmentId },
                    {
                        $push: {
                            service: service._id
                        }
                    }
                )
            ]);

            if (saveService.modifiedCount === 0) throw new MyError('save service fail!');
            if (updateApartment.modifiedCount === 0) throw new MyError('update apartment fail');
        }
    }
}

module.exports = new ServiceApartmentService();