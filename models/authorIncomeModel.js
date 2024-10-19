// models/authorIncomeModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorIncomeSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "Author", required: true }, // Reference to Author
    paymentAmount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    paymentAccountId: {
      type: Schema.Types.ObjectId,
      ref: "AuthorAccount",
      required: true,
    }, // Reference to AuthorAccount
    paymentStatus: { type: String, required: true }, // e.g., "Completed", "Pending", etc.
    paymentDescription: { type: String },
    invoice: { type: String }, // Stores invoice file path or ID
  },
  { timestamps: true } // Automatically handles createdAt and updatedAt
);

module.exports = mongoose.model("AuthorIncome", authorIncomeSchema);
