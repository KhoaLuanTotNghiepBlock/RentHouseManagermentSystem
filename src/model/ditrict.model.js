const mongoose = require('mongoose');

var districtSchema = new mongoose.Schema(
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
        }
    }, {
    versionKey: false
}
);

const District = mongoose.model('District', districtSchema, 'Dictrict')
module.exports = District;