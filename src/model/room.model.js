const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;
const Timezone = require("mongoose-timezone");
const ulity = require("./shema/utility");
const attachment = require("./shema/attachment");
const address = require("./shema/address");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    acreage: {
      type: Number,
      require: true,
    },
    owner: {
      type: Object,
    },
    nbCurrentPeople: {
      type: Number,
      default: 0,
    },
    totalNbPeople: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'All'],
      default: 'All'
    },
    typeRoom: {
      type: String,
      enum: ["DORMITORY", "ROOM_FOR_RENT", "ROOM_FOR_SHARE"],
      default: "ROOM_FOR_RENT",
    },
    deposit: {
      type: Number,
      default: 0,
    },
    description:
    {
      type: String,
      default: "",
    },
    floor: {
      type: Number,
      default: 0,
    },
    amentilities: ulity,
    period: {
      type: Number,
      default: 0,
    },
    basePrice: {
      type: Number,
      default: 0,
    },
    address,
    roomAttachment: attachment,
    services: [
      {
        type: ObjectId,
        ref: "Service"
      }
    ],
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

roomSchema.plugin(Timezone);
const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
