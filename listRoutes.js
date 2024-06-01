// routes\listRoutes.js
const express = require('express');
const listEndpoints = require('express-list-endpoints');
const app = express();
const routes = require('./routes/index'); // Adjust the path to your routes file

// Middleware and routes setup
app.use(express.json());
app.use('/api', routes);

// List all the routes
const endpoints = listEndpoints(app);
console.log(endpoints);
