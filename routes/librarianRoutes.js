//routes\librarianRoutes.js
const express = require("express");
const librarianController = require("../controllers/librarianController");
const upload = require("../utils/multer");
const router = express.Router();

router.post("/store", librarianController.storeLibrarian);
router.get("/all", librarianController.getAllLibrarians);
router.get("/all-by-library", librarianController.getLibrariansByLibrary);
router.get("/:id", librarianController.showLibrarian);
router.post("/update/:id", librarianController.updateLibrarian);
router.get("/toggle-status/:id", librarianController.changeStatus);
router.post("/delete/:id", librarianController.deleteLibrarian);
// router.post("/update-plan", librarianController.updatePlan);
router.post("/search", librarianController.searchLibrarians);

module.exports = router;
