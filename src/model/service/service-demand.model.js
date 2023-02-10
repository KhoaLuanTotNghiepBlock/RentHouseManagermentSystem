const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema;

const serviceDemandSchema = new mongoose.Schema(
  {
    oldIndicator: {
      type: Number,
      default: 0,
    },
    newIndicator: {
      type: Number,
      default: 0,
    },
    service: {
      type: ObjectId,
      ref: "Service",
    },
    quality: {
      type: Number,
      default: 0,
    },
    room: {
      type: ObjectId,
      ref: "Room",
    },
    amount: {
      type: Number,
      default: 0,
    },
    atMonth: {
      type: Number,
      default: 1,
    },
    atYear: {
      type: Number,
      default: 1,
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

serviceDemandSchema.plugin(Timezone);

const ServiceExpense = mongoose.model("ServiceDemand", serviceDemandSchema);
module.exports = ServiceExpense;
