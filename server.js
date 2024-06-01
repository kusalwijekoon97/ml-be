// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan"); // HTTP request logger
const helmet = require("helmet"); // Security middleware
const cors = require("cors"); // Enable Cross-Origin Resource Sharing
const mongoose = require("mongoose"); // MongoDB ODM
const routes = require("./routes/index"); // Import routes

const port = process.env.PORT || 5002;

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // Logging middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is started on http://localhost:${port}`);
});
