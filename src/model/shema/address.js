const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const { ObjectId } = mongoose.Schema;

const addressSchema = new mongoose.Schema(
  {
    code_city: {
      type: ObjectId,
      ref: "City",
      required: true,
    },
    code_dictrict: {
      type: ObjectId,
      ref: "Ditrict",
      required: true,
    },
    code_ward: {
      type: ObjectId,
      ref: "Ward",
      require: true,
    },
    code_street: {
      type: ObjectId,
      ref: "Street",
      required: true,
    },
    Lat_ggmap: {
      type: Number,
      required: true,
    },
    Lng_ggmap: {
      type: Number,
      required: true,
    },
    address_detail: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    autoCreate: false,
  },
);

addressSchema.plugin(Timezone);

module.exports = addressSchema;
