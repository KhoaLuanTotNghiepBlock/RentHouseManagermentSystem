const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
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
        }
    }, {
    versionKey: false
}
);

const City = mongoose.model('City', citySchema, 'City')

module.exports = City;