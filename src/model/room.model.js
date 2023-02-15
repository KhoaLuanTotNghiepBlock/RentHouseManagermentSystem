const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;
const { Schema } = mongoose;
const Timezone = require("mongoose-timezone");
const ulity = require("./shema/utility");
const attachment = require("./shema/attachment");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    acreage: {
      type: Number,
      require: true,
    },
    apartment: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
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
    amentities: ulity,
    period: {
      type: Number,
      default: 0,
    },
    basePrice: {
      type: Number,
      default: 0,
    },
    imgAvatar: {
      type: String,
      default: "",
    },
    roomAttachment: attachment,
    service: [
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
