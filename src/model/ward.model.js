const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const wardSchema = new mongoose.Schema(
    {
        code: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        typename: {
            type: String,
            required: true
        },
        parent_code: {
            type: Number,
            required: true
        },
        parent_code_city: {
            type: Number,
            required: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);