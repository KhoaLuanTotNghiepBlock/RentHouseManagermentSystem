const mongoose = require("mongoose");
const Timezone = require("mongoose-timezone");

const apartmentServiceSchema = new mongoose.Schema(
  {
    services: [],
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

apartmentServiceSchema.plugin(Timezone);

const ApartmentService = mongoose.model("ApartmentService", apartmentServiceSchema);
module.exports = ApartmentService;
