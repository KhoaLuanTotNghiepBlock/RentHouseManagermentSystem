const apartmentService = require("../service/apartment.service");

class ApartmentController {
    constructor(io) {
        this.io = io;
    }

    // [POST] bh/apartment/create-apartment
    async createApartment(req, res, next) {
        try {
            const { userId } = req.auth;
            const apartmentInfo = req.body;

            const { message, errorCode, data } = await apartmentService.createNewApartment(userId, apartmentInfo);

            if (!(message && errorCode && data)) {
                return res.status(500).json({
                    errorCode: 500,
                    message: "Internal server!",
                    data: {},
                });
            }

            return res.status(errorCode).json({
                message,
                errorCode,
                data,
            });

        } catch (error) {
            next(error);
        }
    }


}

module.exports = new ApartmentController();
