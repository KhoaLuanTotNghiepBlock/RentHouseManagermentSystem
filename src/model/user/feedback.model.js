const mongoose = require("mongoose");

const { Schema } = mongoose;

const feebBackSchema = new mongoose.Schema(
  {
    user: {
      type: Object,
      require: true,
    },
    content: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    apartment: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
    },
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

const FeebBack = mongoose.model("FeebBack", feebBackSchema, "FeedBack");
module.exports = FeebBack;
