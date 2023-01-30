const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const User = require('./user/user.model');

const walletSchema = new mongoose.Schema(
    {
        user: {
            type: Object
        },
        balance: {
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

walletSchema.plugin(Timezone);
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;