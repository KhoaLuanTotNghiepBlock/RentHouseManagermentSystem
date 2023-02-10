const bcrypt = require("bcryptjs");

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
};

module.exports = commonHelper;
