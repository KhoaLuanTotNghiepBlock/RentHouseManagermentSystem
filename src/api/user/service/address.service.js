require("dotenv").config();
const axios = require("axios");
const District = require("../../../model/ditrict.model");
const chain = require("../../../model/chain");

const { VIETNAM_DATASET_URL } = process.env;

class AddressService {
  async fetchCityData() {
    try {
      const response = await axios.get(VIETNAM_DATASET_URL);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch city data");
    }
  }

  async getDistrictList() {
    const cityData = await this.fetchCityData();

    return cityData.district.map(({ name, pre }) => ({ name, pre }));
  }

  async getEntitiesByDistrict(districtName, entityType) {
    const cityData = await this.fetchCityData();
    const district = cityData.district.find((d) => d.name === districtName);
    return district ? district[entityType] : [];
  }

  async getWardsByDistrict(districtName) {
    return await this.getEntitiesByDistrict(districtName, "ward");
  }

  async getStreetsByDistrict(districtName) {
    return await this.getEntitiesByDistrict(districtName, "street");
  }

  async getDistrictsFromDatabase() {
    const districts = await District.find();
    return districts.map(({ name }) => name);
  }

  async getWardsFromDatabase(districtName) {
    return await this.getWardsByDistrict(districtName);
  }

  async getStreetsFromDatabase(districtName) {
    return await this.getStreetsByDistrict(districtName);
  }
}

module.exports = new AddressService();
