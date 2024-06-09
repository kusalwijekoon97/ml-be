//routes\adminRoutes.js
const express = require("express");
const adminController = require("../controllers/adminController");
const upload = require("../utils/multer");
const router = express.Router();

router.post("/store", adminController.storeAdmin);
router.get("/all", adminController.getAllAdmins);
router.get("/:id", adminController.showAdmin);
router.post("/update/:id", adminController.updateAdmin);
router.post("/delete/:id", adminController.deleteAdmin);

module.exports = router;
