const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema;

const roomTransactionSchema = new mongoose.Schema(
  {
    transactionHash: { type: String, required: true },
    owner: { type: ObjectId, required: true, ref: 'User' },
    renter: { type: String, default: "" },
    status: { type: String, enum: ["available", "already-rent", "not-available"], default: "available" },
    roomUid: { type: Number, default: -1 },
    roomId: { type: ObjectId, ref: 'Room', required: true },
    value: { type: Number, default: 0 },
    invoiceHash: { type: String, default: "" },
  },
  { timestamp: true }
);

roomTransactionSchema.plugin(Timezone);

const RoomTransaction = mongoose.model("RoomTransaction", roomTransactionSchema);
module.exports = RoomTransaction;
