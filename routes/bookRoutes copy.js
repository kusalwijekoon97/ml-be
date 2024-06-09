// routes\bookRoutes.js
const express = require("express");
const multerForBooks = require("../utils/multerForBooks"); 
const bookController = require("../controllers/bookController");
const router = express.Router();

// Route for storing a book along with file uploads
// router.post("/store", multerForBooks.fields([
//     { name: 'coverImage', maxCount: 1 }, 
//     { name: 'additionalImages', maxCount: 5 }, 
//     { name: 'material[*].formats[*].chapters[*].source', maxCount: 10 } 
// ]), bookController.storeBook);

router.post("/store", multerForBooks.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 },
    { name: 'materialSources', maxCount: 10 } // Changed to a general field for all audio sources
]), bookController.storeBook);

router.get("/all", bookController.getAll);

module.exports = router;
