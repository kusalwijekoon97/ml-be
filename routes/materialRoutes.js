// routes\materialRoutes.js
const express = require("express");
const upload = require("../utils/multer");
const materialController = require("../controllers/materialController");
const router = express.Router();

router.post("/store", upload.single('fileMaterial'), materialController.storeMaterial);
router.get("/all", materialController.getAllMaterials);
router.post("/:id", materialController.showMaterial);
router.post("/update/:id", materialController.updateMaterial);
router.post("/delete/:id", materialController.deleteMaterial);

module.exports = router;
