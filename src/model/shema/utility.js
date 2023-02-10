const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const utilitySchema = new mongoose.Schema(
  {
    isWifi: {
      type: Boolean,
      default: false,
    },
    isMezzanine: {
      type: Boolean,
      default: false,
    },
    isCamera: {
      type: Boolean,
      default: false,
    },
    isParking: {
      type: Boolean,
      default: false,
    },
    isFrigde: {
      type: Boolean,
      default: false,
    },
    isWasingMachine: {
      type: Boolean,
      default: false,
    },
    isTelevison: {
      type: Boolean,
      default: false,
    },
    isAirCoditional: {
      type: Boolean,
      default: false,
    },
    isElevator: {
      type: Boolean,
      default: false,
    },
    isPool: {
      type: Boolean,
      default: false,
    },
    isWardrobe: {
      type: Boolean,
      default: false,
    },
    isPet: {
      type: Boolean,
      default: false,
    },
    isCooking: {
      type: Boolean,
      default: false,
    },
    isBed: {
      type: Boolean,
      default: false,
    },
    isPrivateWC: {
      type: Boolean,
      default: false,
    },
    isSecurity: {
      type: Boolean,
      default: false,
    },
    isNoCurfew: {
      type: Boolean,
      default: false,
    },
    isBalcony: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
    autoCreate: false,
  },
);

utilitySchema.plugin(Timezone);

module.exports = utilitySchema;
