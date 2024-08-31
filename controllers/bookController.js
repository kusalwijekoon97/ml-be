<<<<<<< HEAD
const Book = require("../models/bookModel");
const Author = require("../models/authorModel");
const uploadFiles = require("../middleware/fileUpload/uploadFilesMiddlewareForBooks");

exports.storeBook = async (req, res) => {
  console.log("Payload received:", req.body);
=======
// controllers/bookController.js
const Book = require("../models/bookModel");
const uploadMaterials = require("../middleware/fileUpload/uploadMaterialsMiddleware");

exports.storeBook = async (req, res) => {
>>>>>>> dev-new-05_31_2024
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
      hasSeries,
      noOfSeries,
      bookType,
      chapters
    } = req.body;

<<<<<<< HEAD
    // console.log("material received:", req.body.material);

    const materialSources = req.body.materialSources || [];

    // console.log("materialSources received:", req.body.materialSources);

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: "ISBN already exists" });
    }

    // Validate author existence (if provided)
    if (req.body.authorId) {
      const authorExists = await Author.findById(req.body.authorId);
      if (!authorExists) {
        return res.status(400).json({ message: "Author not found" });
      }
    }

    // Validate category existence (if provided)
    if (req.body.category) {
      const parsedCategory = JSON.parse(req.body.category);
      if (!Array.isArray(parsedCategory)) {
        return res.status(400).json({
          message: "Invalid category format (must be an array of strings)",
        });
      }
      const validCategories = await Promise.all(
        parsedCategory.map(
          async (category) => await Category.exists({ name: category })
        ) // Assuming you have a Category model
      );
      if (validCategories.some((exists) => !exists)) {
        return res.status(400).json({ message: "Invalid category provided" });
      }
    }

    // Upload cover image and additional images (unchanged)
    const coverImageURL = await uploadFiles(req.files.coverImage[0]);
    const additionalImagesURLs = await Promise.all(
      req.files.additionalImages.map(uploadFiles)
    );

    // Upload material sources to S3 and update source locations
    const materialSourcesURLs = await Promise.all(
      req.files.materialSources.map(async (file, index) => {
        if (file === "null") return null;
        const sourceURL = await uploadFiles(file);
        return sourceURL;
      })
    );

    // Parse JSON fields
    const parsedCategory = JSON.parse(category);
    const parsedSubCategory = JSON.parse(subCategory);
    const parsedSeries = JSON.parse(series);
    const parsedMaterial = JSON.parse(material);
    // console.log("parsedMaterial:", parsedMaterial);
    // Create book object with URLs
    const book = new Book({
      name,
      authorId,
      translatorId,
      category: parsedCategory,
      subCategory: parsedSubCategory,
      isbn,
      description,
      publisher,
      publishDate,
      language,
      languageCode,
      firstPublisher,
      accessType,
      seriesNumber,
      series: parsedSeries,
      coverImage: coverImageURL,
      additionalImages: additionalImagesURLs,
      material: parsedMaterial.map((item) => ({
        ...item,
        formats: item.formats.map((format) => ({
          ...format,
          chapters: format.chapters.map((chapter) => ({
            ...chapter,
            source: chapter.source.map((source, sourceIndex) => ({
              ...source,
              source: materialSourcesURLs[sourceIndex], // Update source with uploaded URL
            })),
          })),
        })),
      })),
    });

    // Save book to database
    await book.save();

    res.status(200).json({ message: "Book stored successfully", book });
  } catch (err) {
    console.error("Error during book creation:", err);
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
=======
    // Handle file URLs from uploaded files
    const coverImageUrl = req.awsFiles.find(url => url.includes('coverImage')) || null;

    // Handle completeMaterials
    const completeMaterials = [];
    let index = 0;
    while (req.body[`material[completeMaterials][${index}][formatType]`]) {
      const formatType = req.body[`material[completeMaterials][${index}][formatType]`];
      const publisher = req.body[`material[completeMaterials][${index}][publisher]`];
      const publishedDate = req.body[`material[completeMaterials][${index}][publishedDate]`];
      const sourceFiles = req.awsFiles.filter(url => url.includes(`material[completeMaterials][${index}][source]`)) || [];
      
      sourceFiles.forEach(fileURL => {
        completeMaterials.push({
          formatType,
          publisher,
          publishedDate,
          source: fileURL
        });
      });

      index++;
    }

    // Handle chapters
    const chapterDetails = chapters.map((item, index) => ({
      chapterNumber: item.chapter_number,
      chapterName: item.chapter_name,
      chapterSourcePdf: req.awsFiles.find(url => url.includes(`material[chapters][${index}][chapter_source_pdf]`)) || null,
      chapterSourceEpub: req.awsFiles.find(url => url.includes(`material[chapters][${index}][chapter_source_epub]`)) || null,
      chapterSourceText: req.awsFiles.find(url => url.includes(`material[chapters][${index}][chapter_source_text]`)) || null,
      chapterSourceMp3: req.awsFiles.find(url => url.includes(`material[chapters][${index}][chapter_source_mp3]`)) || null,
      chapterVoice: item.chapter_voice
    }));

    // Create a new Book instance
    const book = new Book({
      name,
      author,
      translator,
      isbn,
      coverImage: coverImageUrl,
      publisher,
      publishDate,
      library,
      category,
      subCategory,
      description,
      hasSeries,
      noOfSeries,
      bookType,
      materials: completeMaterials,
      chapters: chapterDetails
    });

    // Save to database
    await book.save();

    res.status(201).json({ message: "Book stored successfully!", data: book });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
};
>>>>>>> dev-new-05_31_2024
