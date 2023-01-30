const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const addressSchema = new mongoose.Schema(
    {
        code_city: {
            type: Number,
            required: true
        },
        code_dictrict: {
            type: Number,
            required: true
        },
        code_street: {
            type: Number,
            required: true
        },
        Lat_ggmap: {
            type: Number,
            required: true
        },
        Lng_ggmap: {
            type: Number,
            required: true
        },
        address_detail: {
            type: String,
            required: true
        }
    },
    {
        _id: false,
        autoCreate: false
    }
);

addressSchema.plugin(Timezone);
module.exports = addressSchema;