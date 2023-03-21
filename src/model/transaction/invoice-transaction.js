const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const NotFoundError = require("../../exception/NotFoundError");
const Invoice = require("./invoice.model");
const MyError = require("../../exception/MyError");
const ObjectId = mongoose.Types.ObjectId;

const invoiceTransactionSchema = new mongoose.Schema(
    {
        invoiceId: {
            type: ObjectId,
            required: true,
            ref: 'Invoice'
        },
        hash: {
            type: String
        },
        txhash: { type: String }
    },
    {
        timestamps: true,
    },
);

invoiceTransactionSchema.plugin(Timezone);

const InvoiceTransaction = mongoose.model("InvoiceTransaction", invoiceTransactionSchema);
module.exports = InvoiceTransaction;