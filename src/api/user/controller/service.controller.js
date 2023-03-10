const serviceApartmentService = require('../service/service.service');
const ArgumentError = require('../../../exception/ArgumentError');
const demandService = require('../service/demand.service');

class ServiceApartmentController {
    // [POST] /service/unit/create-unit
    async createUnit(req, res, next) {
        try {
            const { errorCode, message, data } = await serviceApartmentService.createUnit(req.body);

            if (!(errorCode && message && data))
                throw new ArgumentError('Create unit ==>');

            return res.status(errorCode).json({
                errorCode,
                message,
                data
            });
        } catch (error) {
            next(error);
        }
    }
    //[PUT] /service/service-demand
    async updateServiceDemand(req, res, next) {
        try {

            const { roomId, demandInfo } = req.body;

            const data = await demandService.updateServiceDemandInvoice(roomId, demandInfo);
            return res.status(200).json({
                message: 'update sucess',
                data,
                errorCode: 200
            });
        } catch (error) {
            next(error);
        }
    }
    // [GET] /service/unit
    async getAllUnit(req, res, next) {
        try {
            const { errorCode, message, data } = await serviceApartmentService.getAllUnit();

            if (!(errorCode && message && data))
                throw new ArgumentError('Get all unit ==>');

            return res.status(errorCode).json({
                errorCode,
                message,
                data
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ServiceApartmentController();