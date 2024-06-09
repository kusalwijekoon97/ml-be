// models\materialModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const materialSchema = new Schema({
  name: String,
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true
  },
});

module.exports = mongoose.model("Material", materialSchema);
