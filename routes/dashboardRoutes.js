// routes\dashboardRoutes.js
const express = require("express");

const dashboardController = require("../controllers/dashboardController");
const router = express.Router();

// dashboard
router.get("/counts", dashboardController.getDashboardCounts);

module.exports = router;


