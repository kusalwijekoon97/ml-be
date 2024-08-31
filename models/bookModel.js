<<<<<<< HEAD
<<<<<<< HEAD
//models/BookModel.js
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
    unique: true,
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
  series: {
    type: String,
    required: false,
  },
  material: [materialSchema],
  is_active: {
    type: Boolean,
    default: true,
  },
=======
// models/bookModel.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: String,
  author: mongoose.Schema.Types.ObjectId,
  translator: mongoose.Schema.Types.ObjectId,
  isbn: String,
  coverImage: String,
  publisher: String,
  publishDate: Date,
  library: mongoose.Schema.Types.ObjectId,
  category: [mongoose.Schema.Types.ObjectId],
  subCategory: [mongoose.Schema.Types.ObjectId],
  description: String,
  hasSeries: Boolean,
  noOfSeries: Number,
  bookType: String,
  materials: [{
    formatType: String,
    publisher: String,
    publishedDate: Date,
    source: String
  }],
  chapters: [{
    chapterNumber: Number,
    chapterName: String,
    chapterSourcePdf: String,
    chapterSourceEpub: String,
    chapterSourceText: String,
    chapterSourceMp3: String,
    chapterVoice: String
  }]
>>>>>>> dev-new-05_31_2024
=======
// models\bookModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sourceSchema = new Schema({
  voice: String,
  duration: String,
  source: String,
>>>>>>> dev-new-05_31_2024
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
  },
});

module.exports = mongoose.model("Book", bookSchema);
