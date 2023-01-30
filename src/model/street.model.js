const mongoose = require('mongoose');

const streetSchema = new mongoose.Schema(
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
    }, {
    versionKey: false
}
);

const Street = mongoose.model('Street', streetSchema, 'Street')
module.exports = Street;