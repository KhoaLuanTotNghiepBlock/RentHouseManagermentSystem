const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Types;
const authSchema = require("../shema/auth");
const MyError = require("../../exception/MyError");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: false,
    },
    phone: {
      type: String,
      default: "",
    },
    identity: {
      type: String,
    },
    auth: authSchema,
    name: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Man", "Female", "Other"],
      default: "Other",
    },
    dob: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
    identityImg: [],
    notifications: [
      {
        type: ObjectId,
        ref: "Notification",
      },
    ],
    enable: {
      type: Boolean,
      default: true,
    },
    apartments: [
      {
        type: ObjectId,
        ref: "Apartment",
      },
    ],
    otp: String,
    otpTime: Date,
    socketId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

UserSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: ["find", "findOne", "aggregate"],
});

UserSchema.plugin(Timezone);

UserSchema.static.checkByIds = async (ids) => {
  const result = ibs.map(async (idItem) => {
    const user = await User.findOne({
      _id: idItem,
      enable: true,
    });

    if (!user) throw new MyError("User not found!");
  });

  return Promise.all(result);
};

UserSchema.statics.checkById = async (_id) => {
  const user = await User.findOne({ _id, isActived: true });

  if (!user) throw new Error("not found user");

  return user;
};

UserSchema.statics.getById = async (_id) => {
  const user = await User.findById(_id);

  if (!user) { throw new Error("user not found!"); }

  const {
    name,
    email,
    username,
    phone,
    identity,
    auth,
    gender,
    dob,
    avatar,
    notifications,
    enable,
    otp, otpTime,
    socketId,
  } = user;

  return {
    name,
    email,
    username,
    phone,
    identity,
    isAdmin: auth.isAdmin,
    gender,
    dob,
    avatar,
    notifications,
    enable,
    otp,
    otpTime,
    socketId,
  };
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
