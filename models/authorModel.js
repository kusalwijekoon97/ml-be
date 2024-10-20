// models/authorModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  died: { type: Boolean, default: false },
  penName: { type: String },
  nationality: { type: String },
  description: { type: String },
  firstPublishDate: { type: Date },
  profileImage: { type: String },
  position: { type: String },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  income: { type: Schema.Types.ObjectId, ref: "AuthorIncome" }, // Reference to AuthorIncome
  socialMedia: { type: Schema.Types.ObjectId, ref: "AuthorSocialMedia" }, // Reference to AuthorSocialMedia
  addedBooks: [{ type: Schema.Types.ObjectId, ref: "Book" }], // Array of references to Books
  accountDetails: [{ type: Schema.Types.ObjectId, ref: "AuthorAccount" }] // Reference to AuthorAccount
}, 
  { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
