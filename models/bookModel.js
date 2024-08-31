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
});

module.exports = mongoose.model('Book', bookSchema);
