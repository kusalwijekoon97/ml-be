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
    unique: true
  },
  address: String,
  phone: {
    type: String,
    required: true,
    unique: true
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
      ref: "Library",
    },
  ],
  restrictions: Array,
  permissions: {
    users: {
      type: Boolean,
      default: false
    },
    readers: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Boolean,
      default: false
    },
    books: {
      type: Boolean,
      default: false
    },
    authors: {
      type: Boolean,
      default: false
    },
    statics: {
      type: Boolean,
      default: false
    },
    sales: {
      type: Boolean,
      default: false
    },
    packages: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Boolean,
      default: false
    }
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
