const express = require("express");
const authenticateToken = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", authenticateToken, (req, res) => {
  res.send(`Welcome to the dashboard, user ID: ${req.user.id}`);
});

module.exports = router;
