const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema;

const roomTransactionSchema = new mongoose.Schema(
  {
    transactionHash: { type: String, required: true },
    owner: { type: ObjectId, required: true, ref: 'User' },
    status: { type: String, enum: ["available", "already-rent", "not-available"], default: "available" },
    roomUid: { type: Number, default: -1 },
    roomId: { type: ObjectId, ref: 'Room', required: true },
    invoiceHash: { type: String, default: "" },
  },
  { timestamp: true }
);

roomTransactionSchema.plugin(Timezone);

const RoomTransaction = mongoose.model("RoomTransaction", roomTransactionSchema);
module.exports = RoomTransaction;
