// utils/multerForBooks.js
const multer = require("multer");

// Use memory storage for storing files in memory
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
