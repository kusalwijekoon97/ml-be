// book routes
const express = require("express");
const bookController = require("../controllers/book");
const upload = require("../multer");
const uploadImage = require("../middleware/middlewareUploadImage");
const uploadAudio = require("../middleware/middlewareUploadAudio");
const uploadText = require("../middleware/middlewareUploadText");

const router = express.Router();

router.post("/store",
    uploadImage.single("coverImage"),
    uploadAudio.array("audioFiles"),
    uploadText.array("textFiles"),
    bookController.storeBook);

module.exports = router;
