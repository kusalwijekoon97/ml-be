//routes\authorRoutes.js
const express = require("express");
const authorController = require("../controllers/authorController");
const upload = require("../utils/multer");
const router = express.Router();

router.post("/store", upload.single('profileImage'), authorController.storeAuthor);
router.get("/all", authorController.getAllAuthors);
router.get("/:id", authorController.showAuthor);
router.post("/update/:id", upload.single('profileImage'), authorController.updateAuthor);
router.post("/delete/:id", authorController.deleteAuthor);

module.exports = router;
