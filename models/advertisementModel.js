//models\advertisementModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const advertisementSchema = new Schema({
  advertisement: {
    type: String,
    required: true,
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
},
  { timestamps: true },
);

module.exports = mongoose.model("Advertisement", advertisementSchema);
