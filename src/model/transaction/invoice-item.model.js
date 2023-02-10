const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");
const serviceDemand = require("../service/service-demand.model");

const { ObjectId } = mongoose.Schema;

const invoiceItemSchema = new mongoose.Schema(
  {
    service: serviceDemand,
    amount: Number,
    invoice: {
      type: ObjectId,
      ref: "Invoice",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

invoiceItemSchema.plugin(Timezone);
const InvoiceItem = mongoose.model("InvoiceItem", invoiceItemSchema);

module.exports = InvoiceItem;
