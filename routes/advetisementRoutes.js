//routes\advertisementRoutes.js
const express = require("express");
const advertisementController = require("../controllers/advertisementController");
const upload = require("../utils/multer");
const router = express.Router();

router.post("/store", upload.single('advertisement'), advertisementController.storeAdvertisement);
router.get("/all", advertisementController.getAllAdvertisements);
router.get("/:id", advertisementController.showAdvertisement);
router.post("/update/:id", upload.single('advertisement'), advertisementController.updateAdvertisement);
router.post("/delete/:id", advertisementController.deleteAdvertisement);

module.exports = router;
