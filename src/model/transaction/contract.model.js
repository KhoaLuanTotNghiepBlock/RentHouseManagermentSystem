const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const NotFoundError = require("../../exception/NotFoundError");

const { ObjectId } = mongoose.Schema.Types;

const contractSchema = new mongoose.Schema(
  {
    period: {
      type: Number,
      default: 0,
    },
    renter: {
      type: ObjectId,
      require: true,
      ref: 'User'
    },
    lessor: {
      type: ObjectId,
      require: true,
      ref: 'User'
    },
    room: {
      type: ObjectId,
      require: true,
      ref: 'Room'
    },
    dateRent: Date,
    payTime: {
      type: Date,
    },
    payMode: {
      type: String,
      enum: ["VNPay", "MoMo", "Bank", "Cash"],
    },
    payment: {
      type: Number,
      default: 0,
    },
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

contractSchema.plugin(Timezone);
const Contract = mongoose.model("Contract", contractSchema);
module.exports = Contract;
