// routes/bookRoutes.js

const express = require("express");
const multer = require("multer");
const upload = require("../utils/multerForMaterials");
const bookController = require("../controllers/bookController");
const router = express.Router();

// Define multer fields configuration based on the frontend form structure
router.post("/store", upload.single('coverImage'), bookController.storeBook);
router.get("/all", bookController.getAllBooks);
router.get("/:id", bookController.showBook);
// router.post("/update/:id", upload.single('fileBook'), bookController.updateBook);
router.post("/delete/:id", bookController.deleteBook);
router.post("/change-status/:id", bookController.changeStatusBook);

module.exports = router;
