const addressService = require("../service/address.service");

class Addresscontroller {
    // [GET] bh/address/ditricts 
    async getDitrict(req, res, next) {
        try {
            const listDitrict = await addressService.getDitrictsFromDatabase();
            return res.status(200).json({
                message: 'success',
                errorCode: 200,
                data: { listDitrict }
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/address/wards/:ditrictName
    async getWard(req, res, next) {
        try {
            const wards = await addressService.getWardFromDatabase(req.params.ditrictName);

            return res.status(200).json({
                message: 'success',
                errorCode: 200,
                data: { wards }
            })
        } catch (error) {
            next(error);
        }
    }

    // [GET] bh/address/streets/:ditrictName
    async getStreet(req, res, next) {
        try {
            const streets = await addressService.getStreetFromDatabase(req.params.ditrictName);

            return res.status(200).json({
                message: 'success',
                errorCode: 200,
                data: { streets }
            })
        } catch (error) {
            next(error);
        }
    }

};

module.exports = new Addresscontroller();