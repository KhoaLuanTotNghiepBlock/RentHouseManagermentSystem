const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema;

const contractStructSchema = new mongoose.Schema(
  {
    transactionHash: { type: String, required: true },
    owner: { type: ObjectId, required: true, ref: 'User' },
    status: { type: String, enum: ["available", "already-rent", "not-available"], default: "available" },
    roomUid: { type: number, default: -1 },
    roomId: { type: ObjectId, ref: 'Room', required: true },

  },
  { timestamp: true }
);

contractStructSchema.plugin(Timezone);

const ContractStruct = mongoose.model("ContractStruct", contractStructSchema);
module.exports = ContractStruct;
