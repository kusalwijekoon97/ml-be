// models\bookModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sourceSchema = new Schema({
  voice: String,
  duration: String,
  source: String,
});

const chapterSchema = new Schema({
  chapterNumber: String,
  chapterName: String,
  source: [sourceSchema],
});

const formatSchema = new Schema({
  formatType: String,
  Publisher: String,
  PublishedDate: String,
  chapters: [chapterSchema],
});

const materialSchema = new Schema({
  type: String,
  totalDuration: Number,
  formats: [formatSchema],
});

const bookSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  translatorId: {
    type: String,
    required: false,
  },
  category: { type: [String], required: true },
  subCategory: [String],
  isbn: {
    type: String,
    required: true,
    unique: true,
  },
  coverImage: String,
  additionalImages: [String],
  description: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  publishDate: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  languageCode: {
    type: String,
    required: true,
  },
  firstPublisher: String,
  accessType: {
    type: String,
    required: true,
  },
  seriesNumber: Number,
  viewInLibrary: {
    type: Boolean,
    default: true,
  },
  series: [String],
  material: [materialSchema],
  is_active: {
    type: Boolean,
    default: true
  },
});

module.exports = mongoose.model("Book", bookSchema);
