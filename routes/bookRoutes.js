// routes/bookRoutes.js

const express = require("express");
const multer = require("multer");
const upload = require("../utils/multerForMaterials");
const bookController = require("../controllers/bookController");
const router = express.Router();

// Define multer fields configuration based on the frontend form structure
router.post("/store", upload.single('coverImage'), bookController.storeBook);

module.exports = router;
