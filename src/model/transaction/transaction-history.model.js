const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema.Types;

const transactionHistorySchema = new mongoose.Schema(
  {
    cost: {
      type: Number,
      require: true,
    },
    detail: {
      type: String,
    },
    wallet: {
      type: ObjectId,
      require: true,
    },
    type: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

transactionHistorySchema.plugin(Timezone);
