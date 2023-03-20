const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const NotFoundError = require("../../exception/NotFoundError");
const { toObjectId } = require("../../utils/common.helper");

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

    plusContract: { type: String, default: "" }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

contractSchema.plugin(Timezone);
contractSchema.statics.getOne = async (contractId, projection = { updatedAt: 0 }) => {
  const roomLookup = {
    from: "rooms",
    let: { room: "$room" },
    pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$room"] } } },
      {
        $lookup: {
          from: "users",
          let: { userId: "$owner" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                avatar: 1,
                phone: 1,
                email: 1,
                identity: 1,
              },
            },
          ],
          as: "owner",
        },
        $lookup: {
          from: "services",
          let: { serviceIds: "$services" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$serviceIds"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                avatar: 1,
                phone: 1,
                email: 1,
                identity: 1,
              },
            },
          ],
          as: "services",
        }
      },
      { $project: { updatedAt: 0 } },
    ],
    as: "room",
  };

  const renterLookup = {
    from: "users",
    let: { userId: "$renter" },
    pipeline: [
      {
        $match: { $expr: { $eq: ["$_id", "$$userId"] } },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          avatar: 1,
          phone: 1,
          email: 1,
          identity: 1,
        },
      },
    ],
    as: "renter",
  };

  const lessorLookup = {
    from: "users",
    let: { userId: "$lessor" },
    pipeline: [
      {
        $match: { $expr: { $eq: ["$_id", "$$userId"] } },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          avatar: 1,
          phone: 1,
          email: 1,
          identity: 1,
        },
      },
    ],
    as: "lessor",
  };
  const items = await Contract.aggregate([
    { $match: { _id: toObjectId(contractId) } },
    { $lookup: roomLookup },
    { $unwind: "$room" },
    { $lookup: renterLookup },
    { $unwind: "$renter" },
    { $lookup: lessorLookup },
    { $unwind: "$lessor" },
    { $project: projection },
  ]);
  return items[0];
}
const Contract = mongoose.model("Contract", contractSchema);
module.exports = Contract;
