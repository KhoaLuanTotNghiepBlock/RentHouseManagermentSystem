const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  typename: {
    type: String,
    required: true,
  },
  parent_code: {
    type: ObjectId,
    required: true,
    ref: "City",
  },
}, {
  versionKey: false,
});

const District = mongoose.model("Dictrict", districtSchema);
module.exports = District;
