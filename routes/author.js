const express = require("express");
const authorController = require("../controllers/author");
const upload = require("../multer");
const router = express.Router();

router.post("/store", upload.single('profileImage'), authorController.storeAuthor);
router.get("/all", authorController.getAllAuthors);
router.get("/:id", authorController.getSingleAuthor);
router.post("/update/:id", upload.single('profileImage'), authorController.updateAuthor);
router.post("/delete/:id", authorController.deleteAuthor);

module.exports = router;
