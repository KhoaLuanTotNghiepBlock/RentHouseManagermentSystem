const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ulity = require('./shema/utility');
const Timezone = require('mongoose-timezone');
const attachment = require('./shema/attachment');

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        areage: {
            type: Number,
            require: true
        },
        apartment: {
            type: Schema.Types.ObjectId,
            ref: 'Apartment'
        },
        nbCurrentPeople: {
            type: Number,
            default: 0
        },
        totalNbPeople: {
            type: Number,
            default: 0
        },
        deposit: {
            type: Number,
            default: 0
        },
        description:
        {
            type: String,
            default: ""
        },
        floor: {
            type: Number,
            default: 0
        },
        amentities: ulity,
        period: {
            type: Number,
            default: 0
        },
        basePrice: {
            type: Number,
            default: 0
        },
        imgAvatar: {
            type: String,
            default: ""
        },
        roomAttachment: attachment,
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

roomSchema.plugin(Timezone);
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;