const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');
const ObjectId = mongoose.Schema.ObjectId;

const roomServiceSchema = new mongoose.Schema(
    {
        service: [
            {
                type: ObjectId,
                ref: 'Service'
            }
        ],
        room: {
            type: ObjectId,
            ref: 'Room'
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

roomServiceSchema.plugin(Timezone);

const RoomService = mongoose.model('RoomService', roomServiceSchema);
module.exports = RoomService;