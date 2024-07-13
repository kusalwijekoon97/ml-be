// routes\index.js
const express = require("express");
const router = express.Router();

const auth = require("../routes/auth/authRoutes");
const admin = require("../routes/adminRoutes");
const user = require("../routes/userRoutes");
const librarian = require("../routes/librarianRoutes");
const author = require("../routes/authorRoutes");
const category = require("../routes/categoryRoutes");
const material = require("../routes/materialRoutes");
const library = require("../routes/libraryRoutes");
const book = require("../routes/bookRoutes");
const advertisement = require("../routes/advetisementRoutes");
const mobileUser = require("../routes/mobileUserRoutes");

// auth routes
router.use("/auth", auth);
// admin routes
router.use("/admins", admin);
// user routes
router.use("/users", user);
// librarian routes
router.use("/librarians", librarian);
// auth routes
router.use("/categories", category);
// author routes
router.use("/authors", author);
// material routes
router.use("/materials", material);
// library routes
router.use("/libraries", library);
// book routes
router.use("/books", book);
// advetisement routes
router.use("/advertisements", advertisement);
// mobileUser routes
router.use("/mobile-users", mobileUser);

module.exports = router;
