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
    required: false,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: false,
  },
  translatorId: {
    type: String,
    required: false,
  },
  category: { type: [String], required: false },
  subCategory: [String],
  isbn: {
    type: String,
    required: false,
    unique: false,
  },
  coverImage: String,
  additionalImages: [String],
  description: {
    type: String,
    required: false,
  },
  publisher: {
    type: String,
    required: false,
  },
  publishDate: {
    type: String,
    required: false,
  },
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
  },
});

module.exports = mongoose.model("Book", bookSchema);
