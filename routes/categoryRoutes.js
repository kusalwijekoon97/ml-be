// routes\categoryRoutes.js
const express = require("express");

const categoryController = require("../controllers/categoryController");
const router = express.Router();

// category
router.post("/main/store", categoryController.storeCategory);
router.get("/main/all", categoryController.getAllCategories);
router.get("/main/:id", categoryController.getSingleCategory);
router.get("/main/search", categoryController.getSearchedCategories);
router.post("/main/update/:id", categoryController.updateCategory);
router.post("/main/delete/:id", categoryController.deleteCategory);
router.post("/main/change-status/:id", categoryController.changeStatusCategory);

module.exports = router;


