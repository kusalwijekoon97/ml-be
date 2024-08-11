// models\libraryModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const librarySchema = new Schema({
  name: String,
  librarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Librarian'
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
    default: true
  },
});

module.exports = mongoose.model("Library", librarySchema);
