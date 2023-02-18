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
    rentHouse: { require: true },
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

contractSchema.static.getById = async (_id) => {
  let contractPineline = [
    {
      path: 'renter',
      select: 'username email phone identity name avatar'
    },
    {
      path: 'lessor',
      select: 'username email phone identity name avatar'
    },
  ];
  const contract = await Contract.findById(_id)
    .select('-updatedAt')
    .populate(contractPineline).lean();

  if (!contract)
    throw new NotFoundError('Contract ==>');

  return { period, renter, lessor, rentHouse, payTime, payMode, payment } = contract;
};

contractSchema.static.getByRenterId = async (_id) => {
  let contractPineline = [
    {
      path: 'renter',
      select: 'username email phone identity name avatar'
    },
    {
      path: 'lessor',
      select: 'username email phone identity name avatar'
    },
  ];
  const contract = await Contract.findOne({ renter: _id })
    .select('-updatedAt')
    .populate(contractPineline).lean();

  if (!contract)
    throw new NotFoundError('Contract ==>');

  return { period, renter, lessor, rentHouse, payTime, payMode, payment } = contract;
};

contractSchema.static.getByLessorId = async (_id) => {
  let contractPineline = [
    {
      path: 'renter',
      select: 'username email phone identity name avatar'
    },
    {
      path: 'lessor',
      select: 'username email phone identity name avatar'
    },
  ];
  const contract = await Contract.findOne({ lessor: _id })
    .select('-updatedAt')
    .populate(contractPineline).lean();

  if (!contract)
    throw new NotFoundError('Contract ==>');

  return { period, renter, lessor, rentHouse, payTime, payMode, payment } = contract;
};

module.exports = Contract;
