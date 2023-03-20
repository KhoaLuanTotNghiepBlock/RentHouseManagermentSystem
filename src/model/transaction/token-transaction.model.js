const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Model = new Schema(
    {
        address: { type: String, required: true },
        chainId: Number,
        name: String,
        symbol: String,
        decimals: Number,
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const TokenTransaction = mongoose.model("token-transaction", Model);
module.exports = TokenTransaction;