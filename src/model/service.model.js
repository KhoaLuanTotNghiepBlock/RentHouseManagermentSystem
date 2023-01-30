const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const Schema = mongoose.Types.ObjectId;

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: " "
        },
        description: {
            type: String,
            default: " "
        },
        basePrice: {
            type: Number,
            default: " "
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

serviceSchema.plugin(Timezone);
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
