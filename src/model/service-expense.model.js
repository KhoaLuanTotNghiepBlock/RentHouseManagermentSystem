const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const ObjectId = mongoose.Schema.ObjectId;

const serviceExpenseSchema = new mongoose.Schema(
    {
        oldIndicator: {
            type: Number,
            default: 0
        },
        newIndicator: {
            type: Number,
            default: 0
        },
        service: {
            type: ObjectId,
            ref: 'Service'
        },
        quality: {
            type: Number,
            default: 0
        },
        room: {
            type: ObjectId,
            ref: 'Room'
        },
        amount: {
            type: Number,
            default: 0
        },
        atMonth: {
            type: Number,
            default: 1
        },
        atYear: {
            type: Number,
            default: 1
        },
        user: {
            type: ObjectId,
            ref: 'User'
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

serviceExpenseSchema.plugin(Timezone);

const ServiceExpense = mongoose.model('ServiceExpense', serviceExpenseSchema);
module.exports = ServiceExpense;