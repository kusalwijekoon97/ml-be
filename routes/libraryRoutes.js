// routes\libraryRoutes.js
const express = require("express");

const libraryController = require("../controllers/libraryController");
const router = express.Router();

router.post("/store", libraryController.storeLibrary);
router.get("/all", libraryController.getAllLibraries);
router.get("/all-open", libraryController.getOpenAllLibraries);
router.get("/:id", libraryController.showLibrary);
router.post("/update/:id", libraryController.updateLibrary);
router.post("/change-status/:id", libraryController.changeStatus);
router.post("/delete/:id", libraryController.deleteLibrary);

module.exports = router;
