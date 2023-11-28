const addressService = require("../service/address.service");

class AddressController {
  // [GET] bh/address/ditricts
  async getDistrict(req, res, next) {
    try {
      const listDistrict = await addressService.getDistrictsFromDatabase();
      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: { listDistrict },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDistrictDetail(req, res, next) {
    try {
      const districtName = req.params.districtName;
      const wards = await addressService.getEntitiesByDistrict(
        districtName,
        "ward"
      );

      const streets = await addressService.getEntitiesByDistrict(
        districtName,
        "street"
      );

      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: {
          wards: wards || [],
          streets: streets || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] bh/address/wards/:districtName
  async getWard(req, res, next) {
    try {
      const wards = await addressService.getWardsFromDatabase(
        req.params.districtName
      );

      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: { wards },
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] bh/address/streets/:districtName
  async getStreet(req, res, next) {
    try {
      const streets = await addressService.getStreetsFromDatabase(
        req.params.districtName
      );

      return res.status(200).json({
        message: "success",
        errorCode: 200,
        data: { streets },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
