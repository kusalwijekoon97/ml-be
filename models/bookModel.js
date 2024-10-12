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
    default: '',
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  translatorId: {
    type: String,
    default: '',
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
  },
  coverImage: {
    type: String,
    default: '', 
  },
  additionalImages: {
    type: [String],
    default: [], 
  },
  publisher: {
    type: String,
    default: '', 
  },
  publishDate: {
    type: String,
    default: '', 
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },

  category: { 
    type: [String],
    default: [],
     },
  subCategory: [String],
  language: {
    type: String,
    default: '',
  },
  languageCode: {
    type: String,
    default: '',
  },
  firstPublisher: String,
  accessType: {
    type: String,
    default: '',
  },
  seriesNumber: Number,
  viewInLibrary: {
    type: Boolean,
    default: true,
  },
  series: [String],
  material: [materialSchema],
  deleted: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true
  },
},
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
