const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const ObjectId = mongoose.Schema.ObjectId;

const invoiceSchema = new mongoose.Schema(
    {
        creationDate: Date,
        vat: Number,
        amount: {
            type: Number,
            default: 0
        },
        payStatus: {
            type: String,
            enum: ['Unpaid', 'Pending', 'Complete', 'Failed', 'Declined', 'Cancelled', 'Abandoned', 'Refunsed'],
            default: 'Unpaid'
        },
        paymentMethod: {
            type: String,
            enum: ['VNPay', 'Momo', 'Bank', 'Cash'],
            default: ""
        },
        invoiceItem: [
            {
                type: ObjectId,
                ref: 'InvoiceItem'
            }
        ],
        startDate: Date,
        endDate: Date,
        enable: Boolean
    },
    {
        versionKey: false,
        timestamps: true
    }
);

invoiceSchema.plugin(Timezone);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;

