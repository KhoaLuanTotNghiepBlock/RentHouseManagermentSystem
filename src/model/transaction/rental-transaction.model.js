const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const room = require("../room.model");

const { ObjectId } = mongoose.Schema;

const rentalTransactionSchema = new mongoose.Schema(
  {
    room,
    renter: {
      type: ObjectId,
      ref: "User",
    },
    lessor: {
      type: ObjectId,
      ref: "User",
    },
    invoid: [
      {
        type: ObjectId,
        ref: "Invoice",
      },
    ],
    createAt: Date,
    enable: Boolean,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

rentalTransactionSchema.plugin(Timezone);
const RentalTransaction = mongoose.model("RentalTransaction", rentalTransactionSchema);

module.exports = RentalTransaction;
