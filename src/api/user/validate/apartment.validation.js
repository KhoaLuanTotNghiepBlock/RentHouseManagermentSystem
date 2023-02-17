const Apartment = require("../../../model/apartment.model");
const City = require("../../../model/city.model");
const Ditrict = require("../../../model/ditrict.model");
const Street = require("../../../model/street.model");
const Ward = require("../../../model/ward.model");
const MyError = require("../../../exception/MyError");
const NotFoundError = require('../../../exception/NotFoundError');
const commonUtils = require('../../../utils/common.helper');
const ArgumentError = require("../../../exception/ArgumentError");
// const dateHelper = require("../../../utils/datetime.helper");

const validateAddress = {
  validDitrict: async (nameDitrict) => {
    if (!nameDitrict) { throw new MyError("valid ditrict ==> missing parameter"); }

    const ditrict = await Ditrict.findOne({ name: nameDitrict });

    if (!ditrict) { throw new MyError("Ditrict not found"); }
    return ditrict;
  },

  validWard: async (wardInfo) => {
    const { typename, idCity, idDitrict } = wardInfo;

    if (!typename || !idCity || !idDitrict) { throw new MyError("valid ward ==> missing parameter!"); }

    const ward = await Ward.findOne(
      {
        typename,
        parent_code: idDitrict,
        parent_city_code: idCity,
      },
    );
    if (!ward) { throw new NotFoundError("ward not fond!!"); }
    return ward;
  },

  validStreet: async (streetInfo) => {
    const { name, idCity, idDitrict } = streetInfo;
    if (!name || !idCity || !idDitrict) { throw new MyError("valid street ==> missing parameter!"); }

    const street = await Street.findOne(
      {
        name,
        parent_code: idDitrict,
        parent_city_code: idCity,
      },
    );

    if (!street) { throw new NotFoundError("street not found!"); }
    return street;
  },

  validTypeHome: (typeHome) => {
    if (!typeHome) { throw new MyError("valid type home ==> missing parameter"); }

    const type = ["HOUSE", "APARTMENT"];

    return type.includes(typeHome);
  },
};

const apartmentValidate = {
  /**
     *
     * @param {*} as addressInfo
     * @returns address
     */
  validAddress: async (addressInfo) => {
    const { cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail } = addressInfo;

    if (!(cityName && ditrictName && streetName && wardName && latGgmap && lngGgmap && addressDetail))
      throw new MyError("valid address ==> missing parameter");

    const city = await City.findOne({ name: cityName });
    if (!city)
      throw new NotFoundError("valid address ==> city not found!");

    const ditrict = await validateAddress.validDitrict(ditrictName);
    if (!ditrict)
      throw new NotFoundError("valid address ==>  invalid ditrict");

    const ward = await validateAddress.validWard({
      typename: wardName,
      idCity: city._id,
      idDitrict: ditrict._id,
    });

    if (!ward)
      throw new NotFoundError("valid address ==>  ward not found!");

    const street = await validateAddress.validStreet({
      name: streetName,
      idCity: city._id,
      idDitrict: ditrict._id,
    });

    if (!street)
      throw new NotFoundError("valid address ==> street not found!");

    return {
      code_city: city._id,
      code_dictrict: ditrict._id,
      code_ward: ward._id,
      code_street: street._id,
      Lat_ggmap: latGgmap,
      Lng_ggmap: lngGgmap,
      address_detail: addressDetail,
    };
  },

  validApartmentBasicInfo: async (apartmentInfo) => {
    let {
      name, description, basePrice, acreage,
      typeHome, nbBedRoom, nbBathRoom, nbToilet, nbKitchen, nbFloor, nbRoomAvailable, totalRoom, apartmentAttachment, deposit, period
    } = apartmentInfo;
    console.log("🚀 ~ file: apartment.validation.js:118 ~ validApartmentBasicInfo: ~ deposit, period", deposit, period)

    if (!(name && description && typeHome))
      throw new MyError("valid apartment basic info ==> missing parameter!");

    // validate number
    basePrice = commonUtils.convertToNumber(basePrice);
    acreage = commonUtils.convertToNumber(acreage);
    nbBedRoom = commonUtils.convertToNumber(nbBedRoom);
    nbBathRoom = commonUtils.convertToNumber(nbBathRoom);
    nbToilet = commonUtils.convertToNumber(nbToilet);
    nbKitchen = commonUtils.convertToNumber(nbKitchen);
    nbFloor = commonUtils.convertToNumber(nbFloor);
    nbRoomAvailable = commonUtils.convertToNumber(nbRoomAvailable);
    totalRoom = commonUtils.convertToNumber(totalRoom);
    deposit = commonUtils.convertToNumber(deposit);
    period = commonUtils.convertToNumber(period);

    if (!validateAddress.validTypeHome(typeHome)) { throw new MyError("valid apartment basic info ==> type home invalid!"); }

    const { url } = apartmentAttachment;
    if (url.length === 0) { throw new MyError("valid apartment basic info ==> image empty"); }

    return new Apartment({
      name,
      description,
      basePrice,
      acreage,
      typeHome,
      nbBedRoom,
      nbBathRoom,
      nbToilet,
      nbKitchen,
      nbFloor,
      nbRoomAvailable,
      totalRoom,
      apartmentAttachment,
      deposit,
      period
    });
  },

  validApartment: async (apartmentId) => {
    if (!apartmentId)
      throw new ArgumentError('valid apartment ==>');

    const apartment = await Apartment.findById(apartmentId);
    if (!apartment)
      return NotFoundError('Apartment');

    return apartment;
  }

};

module.exports = { apartmentValidate, validateAddress };
