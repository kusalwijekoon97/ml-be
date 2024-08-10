// models\librarianModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const librarianSchema = new Schema({
  firstName: String,
  lastName: String,
  nic: String,
  email: {
    type: String,
    required: true,
    unique:true
  },
  address: String,
  phone: {
    type: String,
    required: true,
    unique:true
  },
  status: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: "librarian",
  },
  libraries: [
    {
      type: Schema.Types.ObjectId,
      ref: "library",
    },
  ],
  restrictions: Array,
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
  otpVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
    required: false,
  },
  emailCode: {
    type: String,
    required: false,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Librarian", librarianSchema);
