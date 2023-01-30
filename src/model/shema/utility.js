const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const utilitySchema = new mongoose.Schema(
    {
        isWifi: {
            type: Boolean
        },
        isMezzanine: {
            type: Boolean
        },
        isCamera: {
            type: Boolean
        },
        isParking: {
            type: Boolean
        },
        isFrigde: {
            type: Boolean
        },
        isWasingMachine: {
            type: Boolean
        },
        isTelevison: {
            type: Boolean
        },
        isAirCoditional: {
            type: Boolean
        },
        isElevator: {
            type: Boolean
        },
        isPool: {
            type: Boolean
        },
        isWardrobe: {
            type: Boolean
        },
        isPet: {
            type: Boolean
        },
        isCooking: {
            type: Boolean
        },
        isBed: {
            type: Boolean
        },
        isPrivateWC: {
            type: Boolean
        }
    },
    {
        _id: false,
        autoCreate: false
    }
);

utilitySchema.plugin(Timezone);

module.exports = utilitySchema;