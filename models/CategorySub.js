const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubCategoriesSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'category',
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("subCategory", SubCategoriesSchema);
