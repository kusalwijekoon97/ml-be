// routes\index.js
const express = require("express");
const router = express.Router();

const author = require("../routes/authorRoutes");
const category = require("../routes/categoryRoutes");

// category routes
router.use("/categories", category); 
// author routes
router.use("/authors", author); 

module.exports = router;
