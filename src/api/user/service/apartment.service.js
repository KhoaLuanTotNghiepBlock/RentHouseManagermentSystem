// const Apartment = require("../../../model/apartment.model");
// const City = require("../../../model/city.model");
// const Ditrict = require("../../../model/ditrict.model");
// const Street = require("../../../model/street.model");
const apartmentvalidate = require("../validate/apartment.validation");
const User = require("../../../model/user/user.model");

class ApartmentService {
  async createNewApartment(_id, apartmentInfo) {
    if (!(_id && apartmentInfo)) {
      return {
        errorCode: 400,
        message: "create apartment ==> Missing parameter!",
        data: {},
      };
    }

    const
      {
        name, description, basePrice, acreage,
        typeHome, nbBedRoom, nbBathRoom, nbToilet, nbKitchen, nbFloor, nbRoomAvailable, totalRoom,
        amentilities, cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail, apartmentAttachment,
      } = apartmentInfo;

    try {
      const address = await apartmentvalidate.validAddress({
        cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail,
      });

      if (!address) { throw new Error("apartment service ==>  address invalid!"); }

      // basic info mation for create apartment
      const apartment = await apartmentvalidate.validApartmentBasicInfo({
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

      if (!apartment) { throw new Error("apartment service ==> apartment invalid"); }
      const userOwer = await User.getById(_id);

      if (!userOwer) { throw new Error(""); }
      // set uility
      apartment.amentilities.isWifi = amentilities.isWifi;
      apartment.amentilities.isMezzanine = amentilities.isMezzanine;
      apartment.amentilities.isCamera = amentilities.isCamera;
      apartment.amentilities.isParking = amentilities.isParking;
      apartment.amentilities.isFrigde = amentilities.isFrigde;
      apartment.amentilities.isWashingMachine = amentilities.isWashingMachine;
      apartment.amentilities.isTelevision = amentilities.isTelevision;
      apartment.amentilities.isAirCoditional = amentilities.isAirCoditional;
      apartment.amentilities.isElevator = amentilities.isElevator;
      apartment.amentilities.isPool = amentilities.isPool;
      apartment.amentilities.isWardrobe = amentilities.isWardrobe;
      apartment.amentilities.isPet = amentilities.isPet;
      apartment.amentilities.isCooking = amentilities.isCooking;
      apartment.amentilities.isBed = amentilities.isBed;
      apartment.amentilities.isPrivateWC = amentilities.isPrivateWC;
      apartment.amentilities.isSecurity = amentilities.isSecurity;
      apartment.amentilities.isNoCurfew = amentilities.isNoCurfew;
      apartment.amentilities.isBalcony = amentilities.isBalcony;

      // set owner
      apartment.owner = userOwer;

      // set address
      apartment.address = address;
      apartment.enale = true;

      console.log("🚀 ~ file: apartment.service.js:64 ~ ApartmentService ~ createNewApartment ~ apartment", apartment);
      return {
        errorCode: 200,
        message: "Create apartment success",
        data: {
          apartment,
        },
      };
    } catch (error) {
      console.log("🚀 ~ file: apartment.service.js:69 ~ ApartmentService ~ createNewApartment ~ error", error.message);
      return {
        errorCode: 400,
        message: error.message,
        data: {},
      };
    }
  }
}

module.exports = new ApartmentService();
