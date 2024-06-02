// routes\materialRoutes.js
const express = require("express");

const materialController = require("../controllers/materialController");
const router = express.Router();

router.get("/all", materialController.getAllMaterials);
router.post("/:id", materialController.showMaterial);
router.post("/store", materialController.storeMaterial);
router.post("/update/:id", materialController.updateMaterial);
router.post("/delete/:id", materialController.deleteMaterial);

module.exports = router;
