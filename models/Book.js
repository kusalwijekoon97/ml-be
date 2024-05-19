// book model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sourceSchema = new Schema({
  voice: String,
  duration: String,
  source: String
});
const chapterSchema = new Schema({
  chapterNumber: String,
  chapterName: String,
  source: [sourceSchema] 
});
const formatSchema = new Schema({
  formatType: String,
  Publisher: String,
  PublishedDate: String,
  chapters: [chapterSchema] 
});
const materialSchema = new Schema({
  type: String,
  totalDuration: Number,
  formats: [formatSchema],
});
const bookSchema = new Schema({
  name: String,
  authorId: String,
  translatorId: String,
  category: [String],
  subCategory: [String],
  isbn: String,
  coverImage: String,
  additionalImages: [String],
  description: String,
  publisher: String,
  publishDate: String,
  language: String,
  languageCode: String,
  firstPublisher: String,
  accessType: String,
  seriesNumber: Number,
  series: [String],
  material: [materialSchema]
});
module.exports = mongoose.model("Book", bookSchema);