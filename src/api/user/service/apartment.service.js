// const Apartment = require("../../../model/apartment.model");
// const City = require("../../../model/city.model");
// const Ditrict = require("../../../model/ditrict.model");
// const Street = require("../../../model/street.model");
const { apartmentValidate, validateAddress } = require("../validate/apartment.validation");
const User = require("../../../model/user/user.model");
const MyError = require("../../../exception/MyError");
const NotFoundError = require("../../../exception/NotFoundError");
const serviceApartment = require('./service.service');

class ApartmentService {
  async createNewApartment(_id, apartmentInfo) {
    if (!(_id && apartmentInfo))
      throw new MyError('Missing parameter!');

    const
      {
        name, description, basePrice, acreage,
        typeHome, nbBedRoom, nbBathRoom, nbToilet, nbKitchen, nbFloor, nbRoomAvailable, totalRoom,
        amentilities, cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail, apartmentAttachment, services, deposit, period
      } = apartmentInfo;

    const address = await apartmentValidate.validAddress({
      cityName, ditrictName, streetName, wardName, latGgmap, lngGgmap, addressDetail,
    });

    if (!address) throw new MyError("apartment service ==>  address invalid!");

    // basic info mation for create apartment
    let apartment = await apartmentValidate.validApartmentBasicInfo({
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
      deposit, period
    });

    if (!apartment)
      throw new MyError("apartment service ==> apartment invalid");

    const userOwer = await User.getById(_id);
    if (!userOwer) throw new NotFoundError("Not found user!!");

    // set uility
    apartment.amentilities = {};
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
    apartment.enable = true;
    apartment.service = [];

    // save
    await apartment.save();

    // add service
    await serviceApartment.createApartmentService(apartment._id, services);

    return {
      errorCode: 200,
      message: "Create apartment success",
      data: {
        apartment
      },
    }
  }

}
module.exports = new ApartmentService();
