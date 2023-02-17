const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const uility = require("./shema/utility");
const address = require("./shema/address");
const apartmentAttatchment = require("./shema/attachment");
const ObjectId = mongoose.Schema.ObjectId;

const apartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    owner: {
      type: Object,
    },
    basePrice: {
      type: Number,
      require: true,
    },
    acreage: {
      type: Number,
      require: true,
    },
    typeHome:
    {
      type: String,
      enum: ["HOUSE", "APARTMENT"],
      default: "HOUSE",
    },
    nbBedRoom: {
      type: Number,
      default: 0,
    },
    nbBathRoom: {
      type: Number,
      default: 0,
    },
    nbToilet: {
      type: Number,
      default: 0,
    },
    nbKitchen: {
      type: Number,
      default: 0,
    },
    nbFloor: {
      type: Number,
      default: 0,
    },
    nbRoomAvailable: {
      type: Number,
      default: 0,
    },
    totalRoom: {
      type: Number,
      default: 0,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    period: {
      type: Number,
      default: 0,
    },
    amentilities: uility,
    address,
    service: [
      {
        type: ObjectId,
        ref: "Service"
      }
    ],
    apartmentAttachment: apartmentAttatchment,
    enable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

apartmentSchema.plugin(Timezone);

const Apartment = mongoose.model("Apartment", apartmentSchema);
module.exports = Apartment;
