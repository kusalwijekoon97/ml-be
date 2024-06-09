// routes\auth\authRoutes.js
const express = require("express");
const authController = require("../../controllers/auth/authController");
const upload = require("../../utils/multer");
const router = express.Router();

// router.post("/login/admin", authController.loginAdmin);
router.post("/user/login", authController.loginUser);
router.post("/user/verify-otp", authController.verifyOtpUser);
router.post("/user/verify-email", authController.verifyEmailUser);
router.post("/user/update-password", authController.updatePasswordUser);
router.post("/librarian/login", authController.loginLibrarian);
router.post("/librarian/verify-otp", authController.verifyOtpLibrarian);
router.post("/librarian/verify-email", authController.verifyEmailLibrarian);
router.post("/librarian/update-password", authController.updatePasswordLibrarian);

module.exports = router;
