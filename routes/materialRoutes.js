// routes\materialRoutes.js
const express = require("express");
const upload = require("../utils/multer");
const materialController = require("../controllers/materialController");
const router = express.Router();

router.post("/store", upload.single('fileMaterial'), materialController.storeMaterial);
router.get("/all", materialController.getAllMaterials);
router.get("/all-open", materialController.getOpenAllMaterials);
router.get("/:id", materialController.showMaterial);
router.post("/update/:id", upload.single('fileMaterial'), materialController.updateMaterial);
router.post("/delete/:id", materialController.deleteMaterial);
router.post("/change-status/:id", materialController.changeStatusMaterial);

module.exports = router;
