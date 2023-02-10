const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema.Types;

const contractSchema = new mongoose.Schema(
  {
    period: {
      type: Number,
      default: 0,
    },
    renter: {
      type: Object,
      require: true,
    },
    lessor: {
      type: Object,
      require: true,
    },
    room: {
      type: ObjectId,
      require: true,
    },
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
