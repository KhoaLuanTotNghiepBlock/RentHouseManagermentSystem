const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Types;

const NotificationSchema = new mongoose.Schema(
  {
    userOwner: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    receiveUser: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      default: "",
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
    enable: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

NotificationSchema.plugin(Timezone);
const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
