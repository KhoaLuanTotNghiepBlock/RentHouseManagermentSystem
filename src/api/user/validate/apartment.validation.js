const Apartment = require("../../../model/apartment.model");
const City = require("../../../model/city.model");
const Ditrict = require("../../../model/ditrict.model");
const Street = require("../../../model/street.model");
const Ward = require("../../../model/ward.model");
const Address = require("../../../model/shema/address");
// const dateHelper = require("../../../utils/datetime.helper");

const apartmentValidate = {
  validDitrict: async (nameDitrict) => {
    if (!nameDitrict) { throw new Error("valid ditrict ==> missing parameter"); }

    const ditrict = await Ditrict.findOne({ name: nameDitrict });
    if (!ditrict) { throw new Error("Ditrict not found"); }
    return ditrict;
  },

  validWard: async (wardInfo) => {
    const { name, idCity, idDitrict } = wardInfo;
    if (!name || idCity || idDitrict) { throw new Error("valid ward ==> missing parameter!"); }

    const ward = await Ward.findOne(
      {
        name,
        parent_code: idDitrict,
        parent_city_code: idCity,
      },
    );
    if (!ward) { throw new Error("ward not fond!!"); }
    return ward;
  },

  validStreet: async (streetInfo) => {
    const { name, idCity, idDitrict } = streetInfo;
    if (!name || idCity || idDitrict) { throw new Error("valid street ==> missing parameter!"); }

    const street = await Street.findOne(
      {
        name,
        parent_code: idDitrict,
        parent_city_code: idCity,
      },
    );

    if (!street) { throw new Error("street not found!"); }
    return street;
  },

  validTypeHome: (typeHome) => {
    if (!typeHome) { throw new Error("valid type home ==> missing parameter"); }

    const type = ["DORMITORY", "ROOM_FOR_RENT", "ROOM_FOR_SHARE", "HOUSE", "APARTMENT"];

    return type.includes(typeHome);
  },

  /**
     *
     * @param {*} as addressInfo
     * @returns address
     */
  validAddress: async (addressInfo) => {
    const {
      cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail,
    } = addressInfo;
    try {
      if (!(cityName && ditrictName && streetName && wardName && latGgmap && lngGgmap && addressDetail)) { throw new Error("valid address ==> missing parameter"); }

      const city = await City.findOne({ name: cityName });
      if (!city) { throw new Error("valid address ==> city not found!"); }

      const ditrict = await this.validDitrict(ditrictName);
      if (!ditrict) { throw new Error("valid address ==>  invalid ditrict"); }

      const ward = await this.validWard({
        name: wardName,
        idCity: city._id,
        idDitrict: ditrict._id,
      });

      if (!ward) { throw new Error("valid address ==>  ward not found!"); }

      const street = await this.validStreet({
        name: streetName,
        idCity: city._id,
        idDitrict: ditrict._id,
      });
      if (!street) { throw new Error("valid address ==> street not found!"); }

      return new Address(
        {
          code_city: city._id,
          code_dictrict: ditrict._id,
          code_ward: ward._id,
          code_street: street._id,
          Lat_ggmap: latGgmap,
          Lng_ggmap: lngGgmap,
          address_detail: addressDetail,
        },
      );
    } catch (error) {
      console.log("🚀 ~ file: apartment.validation.js:73 ~ validAddress: ~ error", error.message);
      return null;
    }
  },

  /**
     *
     * @param {name, description, basePrice, acreage,typeHome, nbBedRoom, nbBathRoom, nbToilet, nbKitchen, nbFloor, nbRoomAvailable, totalRoom, apartmentAttachment} apartmentInfo
     * @returns { name,description,basePrice,acreage,typeHome,nbBedRoom,nbBathRoom,nbToilet,nbKitchen,nbFloor,nbRoomAvailable,totalRoom,apartmentAttachment}
     */
  validApartmentBasicInfo: async (apartmentInfo) => {
    const {
      name, description, basePrice, acreage,
      typeHome, nbBedRoom, nbBathRoom, nbToilet, nbKitchen, nbFloor, nbRoomAvailable, totalRoom, apartmentAttachment,
    } = apartmentInfo;

    try {
      if (!(name && description && basePrice && acreage && typeHome && nbBedRoom && nbBathRoom
        && nbToilet && nbKitchen && nbFloor && nbRoomAvailable && totalRoom)) { throw new Error("valid apartment basic info ==> missing parameter!"); }

      if (!this.typeHome(typeHome)) { throw new Error("valid apartment basic info ==> type home invalid!"); }

      if (
        basePrice.isNaN() || acreage.isNaN() || nbBedRoom.isNaN() || nbBathRoom.isNaN() || nbKitchen.isNaN() || nbFloor.isNaN()
        || nbRoomAvailable.isNaN() || totalRoom.isNaN()) { throw new Error("valid apartment basic info ==> value must be number"); }

      if (apartmentAttachment.isEmpty()) { throw new Error("valid apartment basic info ==> image empty"); }

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
      });
    } catch (error) {
      console.log("🚀 ~ file: apartment.validation.js:122 ~ validApartmentBasicInfo: ~ error", error.message);
      return null;
    }
  },
};

module.exports = apartmentValidate;
