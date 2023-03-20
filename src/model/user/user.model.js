const mongoose = require('mongoose');
const mongooseDelete = require("mongoose-delete");
const Timezone = require("mongoose-timezone");
const wallet = require('./wallet.model');
const { ObjectId } = mongoose.Types;
const authSchema = require("../shema/auth");
const MyError = require("../../exception/MyError");
const ArgumentError = require('../../exception/ArgumentError');

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
      default: ""
    },
    auth: authSchema,
    address: {
      city: { type: String, default: null },
      district: { type: String, default: null },
      ward: { type: String, default: null },
      street: { type: String, default: null },
    },
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
    wallet,
    identityImg: [
      {
        url: String,
      }
    ],
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
    otp: String,
    otpTime: Date,
    socketId: {
      type: String,
      default: "",
    },
    wishList: []
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

UserSchema.statics.getById = async (id) => {
  const user = await User.findById(id);

  if (!user) { throw new Error("user not found!"); }

  const {
    _id,
    name,
    email,
    username,
    phone,
    identity,
    gender,
    dob,
    avatar,
    wallet,
    enable
  } = user;

  return {
    _id,
    name,
    email,
    username,
    phone,
    identity,
    gender,
    dob,
    wallet,
    avatar,
    enable
  };
};

UserSchema.statics.getNewest = async () => {
  const users = await User.find({ gender: 'Other' }).sort({ _id: -1 });
  console.log("🚀 ~ file: user.model.js:146 ~ UserSchema.statics.getNewest= ~ users:", users)
  const user = users[0];
  return user;
}

UserSchema.statics.getUserByIndentity = async (identity) => {
  if (!identity)
    throw new ArgumentError('user identity ==> ');

  const user = await User.findOne({ identity });

  if (!user) { throw new Error("user not found!"); }

  const {
    _id,
    name,
    email,
    username,
    phone,
    gender,
    dob,
    avatar,
    enable
  } = user;

  return {
    _id,
    name,
    email,
    username,
    phone,
    identity,
    gender,
    dob,
    avatar,
    enable
  };
}

UserSchema.statics.getUserByWallet = async (walletAddress) => {
  if (!walletAddress)
    throw new ArgumentError('user wallet address ==>');

  const user = await User.findOne({ 'wallet.walletAddress': walletAddress });

  if (!user) { throw new Error("user not found!"); }
  const {
    _id,
    name,
    email,
    username,
    phone,
    identity,
    gender,
    dob,
    avatar,
    wallet,
    enable
  } = user;

  return {
    _id,
    name,
    email,
    username,
    phone,
    identity,
    gender,
    dob,
    wallet,
    avatar,
    enable
  };

}

const User = mongoose.model("User", UserSchema);

module.exports = User;
