//routes\mobileUserRoutes.js
const express = require("express");
const mobileUserController = require("../controllers/mobileUserController");
const upload = require("../utils/multer");
const router = express.Router();

router.post("/store", upload.single('profileImage'), mobileUserController.storeMobileUser);
router.get("/all", mobileUserController.getAllMobileUsers);
router.get("/:id", mobileUserController.showMobileUser);
router.post("/update/:id", upload.single('profileImage'), mobileUserController.updateMobileUser);
router.post("/delete/:id", mobileUserController.deleteMobileUser);

module.exports = router;
