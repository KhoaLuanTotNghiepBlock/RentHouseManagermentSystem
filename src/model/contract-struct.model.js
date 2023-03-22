const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema;

const contractStructSchema = new mongoose.Schema(
  {
    transactionHash: { type: String, required: true },
    owner: { type: ObjectId, required: true, ref: 'User' },
    status: { type: Boolean, default: false }
  },
  { timestamp: true }
);

contractStructSchema.plugin(Timezone);

const ContractStruct = mongoose.model("ContractStruct", contractStruct);
module.exports = ContractStruct;
