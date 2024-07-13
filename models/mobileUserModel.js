// models\mobileUserModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MobileUserSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['READER', 'AUTHOR', 'ADMIN'],
    default: 'READER'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BANNED'],
    default: 'ACTIVE'
  },
  libraries: [{
    type: Schema.Types.ObjectId,
    ref: 'Library'
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  deleted: {
    type: Boolean,
    default: false
  },
  hash: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    required: false,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("MobileUser", MobileUserSchema);
