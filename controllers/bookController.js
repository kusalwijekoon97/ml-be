// controllers\bookController.js
const Book = require("../models/bookModel");
const Author = require("../models/authorModel");

exports.storeBook = async (req, res) => {
  console.log(11111111111111111);
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
      material,
    } = req.body;

    // // Required fields validation
    // if (!name ||!authorId ||!isbn ||!publisher ||!publishDate ||!language ||!languageCode ||!accessType) {
    //   return res
    //     .status(400)
    //     .json({ message: "All required fields must be provided." });
    // }

    // Check if author exists
    const authorExists = await Author.findById(authorId);
    if (!authorExists) {
      return res.status(400).json({ message: "Author does not exist." });
    }

    // Check if translator exists (if provided)
    // if (translatorId) {
    //   const translatorExists = await Translator.findById(translatorId);
    //   if (!translatorExists) {
    //     return res.status(400).json({ message: "Translator does not exist." });
    //   }
    // }

    // Check if book with same ISBN already exists
    const bookExists = await Book.findOne({ isbn });
    // console.log(bookExists);
    if (bookExists) {
      return res
        .status(400)
        .json({ message: "A book with the same ISBN already exists." });
    }

    const response = await Book.create({ ...req.body, viewInLibrary: true });
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
