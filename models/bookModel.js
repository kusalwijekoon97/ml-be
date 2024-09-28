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
  source: String,
});

const formatSchema = new Schema({
  formatType: String,
  Publisher: String,
  PublishedDate: String,
  completeSource: String, 
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
  description: {
    type: String,
    required: false,
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
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
    required: true,
  },
  
  category: { type: [String], required: false },
  subCategory: [String],
  language: {
    type: String,
    required: false,
  },
  languageCode: {
    type: String,
    required: false,
  },
  firstPublisher: String,
  accessType: {
    type: String,
    required: false,
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
  }
});

module.exports = mongoose.model("Book", bookSchema);
