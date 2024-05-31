const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sampleController');

// Define routes
router.get('/', sampleController.home);
router.get('/items', sampleController.getItems);
router.post('/items', sampleController.createItem);

module.exports = router;
