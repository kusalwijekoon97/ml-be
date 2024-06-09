const express = require("express");
const multer = require("../utils/multerForBooks"); // Assuming your multer configuration
const bookController = require("../controllers/bookController");

const { singleImageUpload, multipleImageUpload } = require("../middleware/fileUpload/middlewareUploadImage");
const uploadAudio = require("../middleware/fileUpload/middlewareUploadAudio");
const uploadText = require("../middleware/fileUpload/middlewareUploadText");

const router = express.Router();

// Middleware to parse request bodies (assuming JSON)
router.use(express.json());

// Routes involving file uploads
router.post(
  "/store",
  singleImageUpload().single("coverImage"),
  multipleImageUpload().array("additionalImages"),
  uploadAudio.array("audioFiles"),
  uploadText.array("textFiles"),
  bookController.storeBook
);

// Other book routes (assuming they don't involve file uploads)
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;
