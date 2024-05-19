// book controller
const Book = require("../models/Book");
const Author = require("../models/Author");

const uploadImage = require("../middleware/uploadImageMiddleware");
const s3Client = require("../s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

exports.storeBook = async (req, res) => {
  try {
    const {
      name,
      authorId,
      translatorId,
      category,
      subCategory,
      isbn,
      coverImage,
      additionalImages,
      description,
      publisher,
      publishDate,
      language,
      languageCode,
      firstPublisher,
      accessType,
      seriesNumber,
      Series,
      material,
    } = req.body;

    // Check if ISBN already exists
    const isbnExists = await Book.exists({ isbn });
    if (isbnExists) {
      return res.status(400).json({
        message: "Cannot add another book with the same ISBN",
      });
    }

    // Check if author exists
    const authorExists = await Author.exists({ _id: authorId });
    if (!authorExists) {
      return res.status(400).json({
        message: "Author does not exist.",
      });
    }

    // Upload cover image
    const profileImageName = await uploadImage(req.file);
    
    if (req.file) {
      req.body.coverImage = await uploadImage(req.file);
    }

    // Upload additional images
    if (req.files && req.files.length > 0) {
      req.body.additionalImages = await Promise.all(
        req.files.map(async (file) => uploadImage(file))
      );
    }

    // Upload audio files
    if (req.files && req.files.length > 0) {
      req.body.audioFiles = await Promise.all(
        req.files.map(async (file) => uploadAudio(file))
      );
    }

    // Upload text files
    if (req.files && req.files.length > 0) {
      req.body.textFiles = await Promise.all(
        req.files.map(async (file) => uploadText(file))
      );
    }

    // Create book
    const response = await Book.create(req.body);

    if (response) {
      return res.status(200).json({
        message: "Book Created",
      });
    } else {
      return res.status(400).json({
        message: "Book Creation failed.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
