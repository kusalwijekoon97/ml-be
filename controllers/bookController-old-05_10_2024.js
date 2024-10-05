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
      language,
      languageCode,
      firstPublisher,
      seriesNumber,
      series,
      material: { completeMaterials, chapters  }
    } = req.body;

    const coverImageName = req.file ? await uploadFile(req.file) : null;

    // Initialize material types
    const material = [];

    // Categorize materials
    const eBookFormats = [];
    const audioBookFormats = [];

    completeMaterials.forEach(materialItem => {
      const formattedMaterial = {
        formatType: materialItem.formatType,
        publisher: materialItem.publisher || '',
        publishedDate: materialItem.publishedDate || '',
        completeSource: materialItem.source || '',
        chapters: [] // Initialize empty chapters array
      };

      if (materialItem.formatType === 'MP3') {
        audioBookFormats.push(formattedMaterial);
      } else if (['PDF', 'EPUB', 'TEXT'].includes(materialItem.formatType)) {
        eBookFormats.push(formattedMaterial);
      }
    });

    // Append chapters to the relevant formats
    chapters.forEach(chapter => {
      const chapterDetails = {
        chapterNumber: chapter.chapter_number,
        chapterName: chapter.chapter_name,
        source: chapter.chapter_source_pdf || chapter.chapter_source_epub || chapter.chapter_source_text || chapter.chapter_source_mp3,
        voice: chapter.chapter_mp3_voice // Add voice only for MP3
      };

      eBookFormats.forEach(format => {
        if (format.formatType === 'PDF' && chapter.chapter_source_pdf) {
          format.chapters.push(chapterDetails);
        } else if (format.formatType === 'EPUB' && chapter.chapter_source_epub) {
          format.chapters.push(chapterDetails);
        } else if (format.formatType === 'TEXT' && chapter.chapter_source_text) {
          format.chapters.push(chapterDetails);
        }
      });

      audioBookFormats.forEach(format => {
        if (format.formatType === 'MP3' && chapter.chapter_source_mp3) {
          format.chapters.push(chapterDetails);
        }
      });
    });

    if (eBookFormats.length > 0) {
      material.push({
        type: 'E_BOOK',
        formats: eBookFormats
      });
    }

    if (audioBookFormats.length > 0) {
      material.push({
        type: 'AUDIO_BOOK',
        formats: audioBookFormats
      });
    }

    // Debugging: Log the final material object
    console.log('Categorized material:', material);

    // Create new book with material
    const newBook = await Book.create({
      name,
      authorId: author,
      translatorId: translator,
      isbn,
      publisher,
      publishDate,
      library,
      category,
      subCategory,
      description,
      coverImage: coverImageName,
      language,
      languageCode,
      firstPublisher,
      seriesNumber,
      series,
      material
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


exports.getAllBooks = async (req, res) => { //retrieving all data
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';

    const query = {
      ...(
        search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
          ],
        }
      ),
    };

    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'authorId',
        select: 'firstname lastname', 
      })
      .populate({
        path: 'library',
        select: 'name', 
      })
      .sort({ name: 1 });

    const totalItems = await Book.countDocuments(query);


    // Check if any books were found
    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No books found",
        error: {
          code: "NO_BOOKS_FOUND",
          details: "There are no books available in the database.",
        },
      });
    }

    // Return the list of books
    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error retrieving books:", err);
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

exports.showBook = async (req, res) => { //retrieve a single book by ID
  try {
    const bookId = req.params.id;
    // Find the book by ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        error: {
          code: "BOOK_NOT_FOUND",
          details: "The book with the provided ID does not exist.",
        },
      });
    }

    // Return the book details
    return res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (err) {
    console.error("Error retrieving book:", err);
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



exports.deleteBook = async (req, res) => { //delete a book by ID
  try {
    const bookId = req.params.id;

    // Find the book by ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        error: {
          code: "BOOK_NOT_FOUND",
          details: "The book with the provided ID does not exist.",
        },
      });
    }

    // Mark the book as deleted (soft delete)
    book.deleted = true;
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};

exports.changeStatusBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Validate that the book ID is provided
    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required",
        error: {
          code: "BOOK_ID_MISSING",
          details: "A valid book ID must be provided in the request parameters.",
        },
      });
    }

    // Find the book by ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        error: {
          code: "BOOK_NOT_FOUND",
          details: `No book found with the ID ${bookId}.`,
        },
      });
    }

    // Toggle the is_active status
    book.is_active = !book.is_active;
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book status changed successfully",
      data: {
        bookId: book._id,
        is_active: book.is_active
      },
    });
  } catch (error) {
    console.error("Error changing book status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.message,
      },
    });
  }
};