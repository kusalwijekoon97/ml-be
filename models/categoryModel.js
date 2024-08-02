const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  library: {
    type: [String],
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  subCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory' // Make sure this matches the model name
  }],
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Category", CategoriesSchema);
