const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;
const Timezone = require("mongoose-timezone");
const attachment = require("./shema/attachment");
const address = require("./shema/address");
const NotFoundError = require("../exception/NotFoundError");
const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    acreage: {
      type: Number,
      require: true,
    },
    owner: {
      type: ObjectId,
      require: true,
      ref: 'User'
    },
    nbCurrentPeople: {
      type: Number,
      default: 0,
    },
    totalNbPeople: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'All'],
      default: 'All'
    },
    typeRoom: {
      type: String,
      enum: ["DORMITORY", "ROOM_FOR_RENT", "ROOM_FOR_SHARE", "HOUSE", "APARTMENT"],
      default: "ROOM_FOR_RENT",
    },
    deposit: {
      type: Number,
      default: 0,
    },
    description:
    {
      type: String,
      default: "",
    },
    amentilities: [],
    basePrice: {
      type: Number,
      default: 0,
    },
    address,
    roomAttachment: attachment,
    services: [
      {
        type: ObjectId,
        ref: "Service"
      }
    ],
    enable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

roomSchema.plugin(Timezone);

roomSchema.statics.getById = async (_id) => {
  const roomPineline = [
    {
      path: 'owner',
      select: 'username email phone identity name avatar'
    }
  ]
  const room = await Room.findById(_id)
    .select('-updatedAt')
    .populate(roomPineline).lean();

  if (!room)
    throw new NotFoundError('room not found!');

  return room;
};


const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
