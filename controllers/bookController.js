// controllers/bookController.js
const Book = require("../models/bookModel");
const uploadMaterials = require("../middleware/fileUpload/uploadMaterialsMiddleware");

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
      hasSeries,
      noOfSeries,
      bookType,
      chapters
    } = req.body;

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