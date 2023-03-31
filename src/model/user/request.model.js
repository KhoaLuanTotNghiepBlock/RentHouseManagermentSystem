const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Timezone = require("mongoose-timezone");

const RequestSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['CANCEL_RENTAL', 'INVOICE_TO_PAY'],
            required: true,
            default: 'CANCEL_RENTAL'
        },
        data: {},
        from: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

RequestSchema.plugin(Timezone);
const Request = mongoose.model('Request', RequestSchema);
module.exports = Request;