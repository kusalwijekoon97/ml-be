// models\adminModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordRecoveryToken: {
    type: String,
    required: false,
  },
  recoveryCode: {
    type: String,
    required: false,
  },
  is_active: {
    type: Boolean,
    required: true,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
