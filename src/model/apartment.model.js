const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const uility = require('../model/shema/utility');
const address = require('./shema/address');
const apartmentAttatchment = require('./shema/attachment');

const apartmentSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        description: {
            type: String
        },
        owner: {
            type: Object
        },
        basePrice: {
            type: Number,
            require: true
        },
        arcreage: {
            type: Number,
            require: true
        },
        typeHome:
        {
            type: String,
            enum: ["DORMITORY", 'ROOM_FOR_RENT', 'ROOM_FOR_SHARE', 'HOUSE', 'APARTMENT'],
            default: 'ROOM_FOR_RENT'
        },
        nbBedRoom: {
            type: Number,
            default: 0
        },
        nbBathRoom: {
            type: Number,
            default: 0
        },
        nbToilet: {
            type: Number,
            default: 0
        },
        nbKitchen: {
            type: Number,
            default: 0
        },
        nbFloor: {
            type: Number,
            default: 0
        },
        nbRoomAvaiable: {
            type: Number,
            default: 0
        },
        totalRoom: {
            type: Number,
            default: 0
        },
        amentilities: uility,
        address: address,
        apartmentAttachment: apartmentAttatchment,
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

apartmentSchema.plugin(Timezone);

const Apartment = mongoose.model('Apartment', apartmentSchema);
module.exports = Apartment;
