// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan"); // HTTP request logger
const helmet = require("helmet"); // Security middleware
const cors = require("cors"); // Enable Cross-Origin Resource Sharing
const mongoose = require("mongoose"); // MongoDB ODM
const routes = require("./routes/index"); // Import routes
const logger = require("./utils/logger"); // Import logger
const path = require('path');

const port = process.env.PORT || 5002;

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    logger.info("MongoDB connected");
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
  });

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // Logging middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS

// Middleware to log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api", routes);

// 404 Middleware
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "./src/pages/404.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is started on http://localhost:${port}`);
});
