const Book = require("../models/bookModel");
const Author = require("../models/authorModel");

const uploadImage = require("../middleware/fileUpload/middlewareUploadImage");
const uploadAudio = require("../middleware/fileUpload/middlewareUploadAudio");
const uploadText = require("../middleware/fileUpload/middlewareUploadText");

const s3Client = require("../utils/s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeBook = async (req, res) => {
  try {
    const {name,authorId,translatorId,category,subCategory,isbn,coverImage,additionalImages,description,publisher,publishDate,language,languageCode,firstPublisher,accessType,seriesNumber,Series,material,
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


exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("authorId").populate("category");
    res.status(200).json({ books });
  } catch (error) {
    console.error("Error while retrieving books:", error);
    res.status(500).json({ message: "Error while retrieving books" });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("authorId")
      .populate("category");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ book });
  } catch (error) {
    console.error("Error while retrieving book by ID:", error);
    res.status(500).json({ message: "Error while retrieving book" });
  }
};


// Update a book by ID
exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
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
      series,
      material,
    } = req.body;

    const materialSources = req.body.materialSources || [];

    // Validate author existence (if provided)
    if (authorId) {
      const authorExists = await Author.findById(authorId);
      if (!authorExists) {
        return res.status(400).json({ message: "Author not found" });
      }
    }

    // Validate category existence (if provided)
    if (category) {
      const parsedCategory = JSON.parse(category);
      if (!Array.isArray(parsedCategory)) {
        return res.status(400).json({
          message: "Invalid category format (must be an array of strings)",
        });
      }
      const validCategories = await Promise.all(
        parsedCategory.map(
          async (category) => await Category.exists({ name: category })
        )
      );
      if (validCategories.some((exists) => !exists)) {
        return res.status(400).json({ message: "Invalid category provided" });
      }
    }

    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({ message: "Book updated successfully", updatedBook });
  } catch (error) {
    console.error("Error while updating book:", error);
    res.status(500).json({ message: "Error while updating book" });
  }
};

// Delete a book by ID
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Delete the book
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error while deleting book:", error);
    res.status(500).json({ message: "Error while deleting book" });
  }
};
