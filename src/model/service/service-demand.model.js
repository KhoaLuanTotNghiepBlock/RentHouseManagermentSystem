const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const service = require('../service/service.model');
const MyError = require("../../exception/MyError");
const { ObjectId } = mongoose.Schema;
const QUALITY_TYPE = 0;
const INDICATTOR_TYPE = 1;
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
      ref: 'Service'
    },
    quality: {
      type: Number,
      default: 0,
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
    type: {
      type: Number,
      enum: [QUALITY_TYPE, INDICATTOR_TYPE],
      default: INDICATTOR_TYPE
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

serviceDemandSchema.statics.getNewestservice = async (serviceId) => {
  const serviceDemands = await ServiceDemand.find({ servicce: serviceId }).sort({ _id: -1 });

  if (serviceDemandSchema.length === 0)
    return null;

  return serviceDemands[0];
}

serviceDemandSchema.statics.getLastService = async (serviceId, lastMonth) => {
  const serviceDemand = await ServiceDemand.findOne({ servicce: serviceId, atMonth: lastMonth });

  if (!serviceDemand)
    throw new MyError('service demand invalid');

  return serviceDemand;
}

serviceDemandSchema.statics.getPresentService = async (serviceId, presentMonth) => {
  const serviceDemand = await ServiceDemand.findOne({ servicce: serviceId, atMonth: presentMonth });

  if (!serviceDemand)
    throw new MyError('service demand invalid');

  return serviceDemand;
}


const ServiceDemand = mongoose.model("ServiceDemand", serviceDemandSchema);
module.exports = ServiceDemand;
