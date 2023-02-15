const serviceApartmentService = require('../service/service.service');
const ArgumentError = require('../../../exception/ArgumentError');

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