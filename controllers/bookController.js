// controllers/bookController.js
const Book = require("../models/bookModel");
const uploadFile = require("../middleware/fileUpload/uploadFilesMiddleware");
const s3Client = require("../utils/s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeBook = async (req, res) => {
  try {
    const {
      name,
      author,
      translator,
      isbn,
      publisher,
      publishDate,
      library,
      category,
      subCategory,
      description,
    } = req.body;
    const coverImageName = await uploadFile(req.file);

    const newBook = await Book.create({ 
      name,
      authorId:author,
      translatorId:translator,
      isbn,
      publisher,
      publishDate,
      library,
      category,
      subCategory,
      description,
      coverImage: coverImageName 
    });
    
    if (newBook) {
      return res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: newBook,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Book creation failed",
        error: {
          code: "BOOK_CREATION_FAILED",
          details: "The book could not be created due to an unknown issue.",
        },
      });
    }
  } catch (err) {
    console.error("Error creating book:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};