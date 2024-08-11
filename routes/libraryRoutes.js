// routes\libraryRoutes.js
const express = require("express");

const libraryController = require("../controllers/libraryController");
const router = express.Router();

router.post("/store", libraryController.storeLibrary);
router.get("/all", libraryController.getAllLibraries);
router.get("/:id", libraryController.showLibrary);
router.post("/update/:id", libraryController.updateLibrary);
router.post("/delete/:id", libraryController.deleteLibrary);

module.exports = router;
