// controllers\bookController.js
const Book = require("../models/bookModel");
const Author = require("../models/authorModel");
const uploadFiles = require("../middleware/fileUpload/uploadFilesMiddlewareForBooks");

exports.storeBook = async (req, res) => {
    console.log("Payload received:", req.body);
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
        series,
        material
      } = req.body;

    // // Check if author exists
    // const authorExists = await Author.findById(authorId);
    // if (!authorExists) {
    //   return res.status(400).json({ message: "Author does not exist." });
    // }

    // // Check if book with same ISBN already exists
    // const bookExists = await Book.findOne({ isbn });
    // // console.log(bookExists);
    // if (bookExists) {
    //   return res
    //     .status(400)
    //     .json({ message: "A book with the same ISBN already exists." });
    // }

     // Upload cover image to S3
     const coverImageURL = await uploadFiles(coverImage);

     // Upload additional images to S3
     const additionalImagesURLs = await Promise.all(additionalImages.map(uploadFiles));

     // Extract audio sources and upload to S3
     const audioSources = material.flatMap(item => item.formats.flatMap(format => format.chapters.flatMap(chapter => chapter.source)));
     const audioSourcesURLs = await Promise.all(audioSources.map(source => uploadFiles(source.source)));

     // Create book object with URLs
     const book = new Book({
         name,
         authorId,
         translatorId,
         category,
         subCategory,
         isbn,
         coverImage: coverImageURL,
         additionalImages: additionalImagesURLs,
         description,
         publisher,
         publishDate,
         language,
         languageCode,
         firstPublisher,
         accessType,
         seriesNumber,
         series,
         material: material.map(item => ({
             ...item,
             formats: item.formats.map(format => ({
                 ...format,
                 chapters: format.chapters.map(chapter => ({
                     ...chapter,
                     source: chapter.source.map(source => ({
                         ...source,
                         source: audioSourcesURLs.shift() // Replace source with S3 URL
                     }))
                 }))
             }))
         }))
     });

     // Save book to database
     await book.save();

     res.status(200).json({ message: "Book stored successfully", book });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const books = await Book.find({ viewInLibrary: true })
      .populate("subCategory category")
      .populate({
        path: "category",
        populate: {
          path: "material",
        },
      })
      .sort({ name: 1 });
    if (books.length === 0) {
      return res.status(400).json({
        message: "No books found",
      });
    }
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
