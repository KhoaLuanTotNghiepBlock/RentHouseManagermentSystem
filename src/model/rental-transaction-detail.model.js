const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const ObjectId = mongoose.Schema.Types.ObjectId;

const retalTransactionDetailSchema = new mongoose.Schema(
    {
        serviceExpense: [
            {
                type: ObjectId,
                ref: 'ServiceExpense'
            }
        ],
        amount: {
            type: Number,
            default: 0
        },
        enable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

retalTransactionDetailSchema.plugin(Timezone);
const RetalTransactionDetail = mongoose.model('RetalTransactionDetail', retalTransactionDetailSchema);
module.exports = RetalTransactionDetail;