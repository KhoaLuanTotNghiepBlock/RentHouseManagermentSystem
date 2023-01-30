const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const ObjectId = mongoose.Schema.Types.ObjectId;

const retalTransactionSchema = new mongoose.Schema(
    {
        room: {
            type: ObjectId,
            ref: 'Room'
        },
        renter: {
            type: ObjectId,
            ref: 'User'
        },
        lessor: {
            type: ObjectId,
            ref: 'User'
        },
        startDate: Date,
        endDate: Date,
        transactionDetail: [
            {
                type: Object
            }
        ],
        discount: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number
        },
        isPay: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

retalTransactionSchema.plugin(Timezone);
const RetalTransaction = mongoose.model('RetalTransaction', retalTransactionSchema);

module.exports = RetalTransaction;
