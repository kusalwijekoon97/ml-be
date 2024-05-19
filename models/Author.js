const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    max: 50,
  },
  lastname: {
    type: String,
    required: true,
    max: 50,
  },
  died: {
    type: String,
    max: 12,
    min: 10,
  },
  penName: {
    type: String,
    max: 50,
  },
  nationality: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  firstPublishDate: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: false,
  },
  position: {
    type: String,
  },
  income: {
    type: Number,
    default: 0,
  },
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
},
  { timestamps: true },
);

module.exports = mongoose.model("author", authorSchema);
