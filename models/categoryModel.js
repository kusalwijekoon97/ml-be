const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  library: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library'
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  subCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  }],
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Category", CategoriesSchema);
