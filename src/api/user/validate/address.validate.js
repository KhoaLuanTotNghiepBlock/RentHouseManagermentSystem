const City = require("../../../model/city.model");
const Ditrict = require("../../../model/ditrict.model");
const Street = require("../../../model/street.model");
const Ward = require("../../../model/ward.model");
const MyError = require("../../../exception/MyError");
const NotFoundError = require('../../../exception/NotFoundError');
const commonUtils = require('../../../utils/common.helper');

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

    validAddress: async (addressInfo) => {
        const { cityName, ditrictName, streetName, wardName, addressDetail } = addressInfo;

        if (!(cityName && ditrictName && streetName && wardName && addressDetail))
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
            address_detail: addressDetail,
        };
    },

};

module.exports = validateAddress;
