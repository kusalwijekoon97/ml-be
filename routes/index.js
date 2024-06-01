// routes\index.js
const express = require('express');
const router = express.Router();
const category = require("../routes/categoryRoutes");

// category routes
router.use("/categories", category); 

module.exports = router;
