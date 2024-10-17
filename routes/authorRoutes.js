//routes\authorRoutes.js
const express = require("express");
const authorController = require("../controllers/authorController");
const upload = require("../utils/multer");
const router = express.Router();

router.post("/store", upload.single('profileImage'), authorController.storeAuthor);
router.get("/all", authorController.getAllAuthors);
router.get("/all-open", authorController.getOpenAllAuthors);
router.get("/:id", authorController.showAuthor);
router.post("/update/:id", upload.single('profileImage'), authorController.updateAuthorGeneralInfo);
router.post("/update/account-info/:id", authorController.updateAuthorAccountInfo);
// router.post("/update/added-book-info/:id", authorController.updateAuthorBookList);
router.post("/delete/:id", authorController.deleteAuthor);
router.post("/change-status/:id", authorController.changeStatusAuthor);

module.exports = router;
