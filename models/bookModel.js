//models/BookModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sourceSchema = new Schema({
  voice: { type: String, required: true },
  duration: { type: String, required: true },
  source: { type: String, required: true },
});

const chapterSchema = new Schema({
  chapterNumber: { type: String, required: true },
  chapterName: { type: String, required: true },
  source: { type: [sourceSchema], required: true },
});

const formatSchema = new Schema({
  formatType: { type: String, required: true },
  Publisher: { type: String, required: true },
  PublishedDate: { type: String, required: true },
  chapters: { type: [chapterSchema], required: true },
});

const materialSchema = new Schema({
  type: { type: String, required: true },
  totalDuration: { type: Number, required: true },
  formats: { type: [formatSchema], required: true },
});

const bookSchema = new Schema({
  name: { type: String, required: true },
  authorId: { type: String, required: true },
  translatorId: { type: String },
  category: { type: [String], required: true },
  subCategory: { type: [String] },
  isbn: { type: String, required: true },
  coverImage: { type: String },
  additionalImages: { type: [String] },
  description: { type: String, required: true },
  publisher: { type: String, required: true },
  publishDate: { type: String, required: true },
  language: { type: String, required: true },
  languageCode: { type: String, required: true },
  firstPublisher: { type: String },
  accessType: { type: String, required: true },
  seriesNumber: { type: Number },
  series: { type: [String] },
  material: { type: [materialSchema], required: true },
});

module.exports = mongoose.model("Book", bookSchema);
