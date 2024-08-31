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
      material: { completeMaterials }
    } = req.body;

    const coverImageName = req.file ? await uploadFile(req.file) : null;

    // Initialize material types
    const material = [];

    // Categorize materials
    const eBookFormats = [];
    const audioBookFormats = [];

    completeMaterials.forEach(materialItem => {
      // Debugging: Log each materialItem
      console.log('Processing materialItem:', materialItem);

      const formattedMaterial = {
        formatType: materialItem.formatType,
        publisher: materialItem.publisher || '',
        publishedDate: materialItem.publishedDate || '',
        completeSource: materialItem.source || '', // Ensure you use the correct field name
        chapters: [] // Add chapters if available
      };

      if (materialItem.formatType === 'MP3') {
        audioBookFormats.push(formattedMaterial);
      } else if (['PDF', 'EPUB', 'TEXT'].includes(materialItem.formatType)) {
        eBookFormats.push(formattedMaterial);
      }
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
