// routes\index.js
const express = require("express");
const router = express.Router();

const author = require("../routes/authorRoutes");
const category = require("../routes/categoryRoutes");
const material = require("../routes/materialRoutes");
const library = require("../routes/libraryRoutes");
const book = require("../routes/bookRoutes");

// category routes
router.use("/categories", category);
// author routes
router.use("/authors", author);
// material routes
router.use("/materials", material);
// library routes
router.use("/libraries", library);
// book routes
router.use("/books", book);

module.exports = router;
