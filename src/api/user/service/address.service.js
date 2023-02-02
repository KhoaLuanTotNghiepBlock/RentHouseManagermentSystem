const dotenv = require('dotenv').config();
const axios = require('axios');
const address = require('../../../model/shema/address');

const VIETNAM_DATASET_URL = process.env.VIETNAM_DATASET_URL;

class AddressService {

    async getCity() {
        let data;
        await axios.get(VIETNAM_DATASET_URL)
            .then(response => data = response.data)
            .catch(error => console.log(error));
        return data;
    }

    async getDitrictList() {
        try {
            const cityData = await this.getCity();

            if (!cityData)
                throw new Error('Get city data fail!');

            const listDitrict = cityData.district.map(val => val.name);
            if (!listDitrict)
                throw new Error('Get ditrict fail!');
            return listDitrict;
        } catch (error) {
            console.log("🚀 ~ file: address.service.js:26 ~ AddressService ~ getDitrictList ~ error", error);
            throw new Error(error.message);
        }
    }

    async getWardByDitrict(ditrictName) {
        try {
            const cityData = await this.getCity();

            if (!cityData)
                throw new Error('Get city data fail!');

            let listWard = [];

            cityData.district.map(val => {
                if (val.name === ditrictName)
                    listWard = val.ward;
            });
            console.log("🚀 ~ file: address.service.js:44 ~ AddressService ~ listWard ~ listWard", listWard)
        } catch (error) {
            console.log("🚀 ~ file: address.service.js:47 ~ AddressService ~ getWardByDitrict ~ error", error.message);
            throw new Error(error.message);
        }

    }

    async getStreetByDitrict(ditrictName) {
        try {
            const cityData = await this.getCity();

            if (!cityData)
                throw new Error('Get city data fail!');

            let listSreet = [];

            cityData.district.map(val => {
                if (val.name === ditrictName)
                    listSreet = val.street;
            });

            console.log("🚀 ~ file: address.service.js:63 ~ AddressService ~ getStreetByDitrict ~ listSreet", listSreet)
        } catch (error) {
            console.log("🚀 ~ file: address.service.js:47 ~ AddressService ~ getWardByDitrict ~ error", error.message);
            throw new Error(error.message);
        }
    }
};

module.exports = new AddressService();