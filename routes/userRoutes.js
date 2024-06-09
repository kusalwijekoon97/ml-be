//routes\userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const upload = require("../utils/multer");
const router = express.Router();

router.post("/store", userController.storeUser);
router.get("/all", userController.getAllUsers);
router.get("/all-by-library", userController.getUsersByLibrary);
router.get("/:id", userController.showUser);
router.post("/update/:id", userController.updateUser);
router.get("/toggle-status/:id", userController.changeStatus);
router.post("/delete/:id", userController.deleteUser);
// router.post("/update-plan", userController.updatePlan);
router.post("/search", userController.searchUsers);

module.exports = router;
