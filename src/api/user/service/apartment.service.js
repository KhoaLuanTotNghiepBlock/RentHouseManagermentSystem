const Apartment = require('../../../model/apartment.model');
const City = require('../../../model/city.model');
const Ditrict = require('../../../model/ditrict.model');
const Street = require('../../../model/street.model');

class ApartmentService {
    async createNewApartment(_id, apartmentInfo) {
        const
            { name, description, basePrice, acreage,
                typeHome, nbBedRoom, nbBathRoom, nbToilet, nbKitchen, nbFloor, nbRoomAvailable, totalRoom,
                amentilities, address, apartmentAttachment
            } = apartmentInfo;

    }
};

module.exports = new ApartmentService();
