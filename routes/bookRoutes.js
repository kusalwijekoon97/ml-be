// routes\bookRoutes.js
const express = require("express");
const multerForBooks = require("../utils/multerForBooks"); 
const bookController = require("../controllers/bookController");
const router = express.Router();

router.post("/store", multerForBooks.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 },
    { name: 'materialSources', maxCount: 10 } 
]), bookController.storeBook);

router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;
