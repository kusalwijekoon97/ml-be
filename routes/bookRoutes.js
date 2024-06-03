// routes\bookRoutes.js
const express = require("express");
const multerForBooks = require("../utils/multerForBooks"); 
const bookController = require("../controllers/bookController");
const router = express.Router();

// Route for storing a book along with file uploads
router.post("/store", multerForBooks.fields([
    { name: 'coverImage', maxCount: 1 }, // Cover image (1 file)
    { name: 'additionalImages', maxCount: 5 }, // Additional images (up to 5 files)
    //{ name: 'material[*].formats[*].chapters[*].source', maxCount: 10 } // Audio sources (up to 10 files)
]), bookController.storeBook);

router.get("/all", bookController.getAll);

module.exports = router;
