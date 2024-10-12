// models/authorAccountModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorAccountSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: "Author", required: true }, // Reference to Author
  name: { type: String, required: true },
  bank: { type: String, required: true },
  branch: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountType: { type: String, required: true },  // e.g., "Personal", "Business"
  currency: { type: String, required: true },  // e.g., "USD", "EUR"
  swiftCode: { type: String },  // Optional for international accounts
  iban: { type: String },  // Optional for international accounts
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  incomes: [{ type: Schema.Types.ObjectId, ref: "AuthorIncome" }], // Array of references to AuthorIncome
  description: { type: String },  // Optional internal notes
}, 
  { timestamps: true }
);

module.exports = mongoose.model("AuthorAccount", authorAccountSchema);
