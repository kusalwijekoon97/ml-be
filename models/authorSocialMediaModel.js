// models/authorSocialMediaModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorSocialMediaSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: "Author", required: true }, // Reference to Author
  likes: {
    totalLikes: { type: Number, default: 0 },
    likedBy: [{ type: String }] // Array of user IDs who liked
  },
  follows: {
    totalFollowers: { type: Number, default: 0 },
    followedBy: [{ type: String }] // Array of follower IDs
  }
}, 
  { timestamps: true }
);

module.exports = mongoose.model("AuthorSocialMedia", authorSocialMediaSchema);
