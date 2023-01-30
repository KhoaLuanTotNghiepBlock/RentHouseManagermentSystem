const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const unitSchema = new mongoose.Schema(
    {
        description: String,
        name: String,
        enable: Boolean
    },
    {
        timestamps: true,
        versionKey: false
    }
);

unitSchema.plugin(Timezone);

const Unit = mongoose.model('Unit', unitSchema);
module.exports = Unit;