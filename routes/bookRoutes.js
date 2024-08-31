<<<<<<< HEAD
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
=======
// routes/bookRoutes.js

const express = require("express");
const multer = require("multer");
const upload = require("../utils/multerForMaterials");
const bookController = require("../controllers/bookController");
const router = express.Router();

// Define multer fields configuration based on the frontend form structure
router.post("/store", upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'material[completeMaterials][0][source]', maxCount: 1 },
    { name: 'material[completeMaterials][1][source]', maxCount: 1 },
    { name: 'material[completeMaterials][2][source]', maxCount: 1 },
    { name: 'material[completeMaterials][3][source]', maxCount: 1 },
    // { name: 'material[chapters][][chapter_source_pdf]', maxCount: 10 },
    // { name: 'material[chapters][][chapter_source_epub]', maxCount: 10 },
    // { name: 'material[chapters][][chapter_source_text]', maxCount: 10 },
    // { name: 'material[chapters][][chapter_source_mp3]', maxCount: 10 }
]), bookController.storeBook);
>>>>>>> dev-new-05_31_2024

module.exports = router;
