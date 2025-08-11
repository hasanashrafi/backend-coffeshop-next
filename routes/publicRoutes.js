const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Root endpoint for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'Coffee Shop API is running!', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      users: '/api/users',
      orders: '/api/orders'
    }
  });
});

// Test endpoint for CORS
router.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

router.get('/about-us', publicController.aboutUs);
router.get('/contact-us', publicController.contactUs);

module.exports = router; 