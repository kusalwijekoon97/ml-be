// routes\categoryRoutes.js
const express = require("express");

const categoryController = require("../controllers/categoryController");
const router = express.Router();

// category
router.post("/main/store", categoryController.storeCategory);
router.get("/main/all", categoryController.getAllCategories);
router.get("/main/:id", categoryController.showCategory);
router.get("/main/search", categoryController.getSearchedCategories);
router.post("/main/update/:id", categoryController.updateCategory);
router.post("/main/delete/:id", categoryController.deleteCategory);

// sub category
router.post("/sub/store", categoryController.storeSubCategory);
router.get("/sub/all", categoryController.getAllSubCategories);
router.get("/sub/:id", categoryController.showSubCategory);
router.get("/sub/search", categoryController.getSearchedSubCategories);
router.post("/sub/update/:id", categoryController.updateSubCategory);
router.post("/sub/delete/:id", categoryController.deleteSubCategory);

module.exports = router;

