const bcrypt = require("bcryptjs");
const MyError = require("../exception/MyError");
const ArgumentError = require("../exception/ArgumentError");
const ObjectId = require('mongoose').Types.ObjectId;
const commonHelper = {
  isEmpty: (obj) => {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  },

  getRandomInt: (min, max) => {
    const minRan = Math.ceil(min);
    const maxRan = Math.floor(max);
    return Math.floor(Math.random() * (maxRan - minRan + 1)) + minRan;
  },

  getRandomOTP() {
    return this.getRandomInt(100000, 999999);
  },

  hashPassword: (value) => {
    if (!value) return null;

    return bcrypt.hash(value, 8);
  },

  getPagination: (page, size, total) => {
    const totalPages = Math.ceil(total / size);
    const skip = page * size;
    return {
      skip,
      limit: size,
      totalPages,
    };
  },
  convertToNumber: (value) => {
    value = Number(value);

    if (value === undefined || value === null)
      throw new MyError('missing value');

    if (isNaN(value))
      throw new MyError('Value must be number');

    if (value < 0) {
      throw new Error("Number of floor cannot be negative");
    }
    return value;
  },

  validateGender: (value) => {
    if (!value)
      throw new ArgumentError('valid gender ==> ');

    const gender = ['Male', 'Female', 'All'];

    return gender.includes(value);
  },

  deepCopy: (obj) => {
    if (typeof (obj) === 'object') {
      if (Array.isArray(obj))
        return obj.map(this.deepCopy);
      else {
        const copy = {};
        for (const value in obj)
          copy[value] = this.deepCopy(obj[value]);

        return copy;
      }
    }
    return obj;
  },
  toObjectId: (string) => {
    if (!string)
      throw new ArgumentError('to objectIb ==> ');

    return new ObjectId(string);
  }
};

module.exports = commonHelper;
