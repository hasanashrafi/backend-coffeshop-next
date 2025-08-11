const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Test endpoint that doesn't require database
router.get('/test', (req, res) => {
  res.json({
    message: 'Products route is working!',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Special product lists (must come before :id routes)
router.get('/discounted/all', productController.getDiscountedProducts);
router.get('/top-rated/all', productController.getTopRatedProducts);
router.get('/best-selling/all', productController.getBestSellingProducts);
router.get('/category/:categorySlug', productController.getProductsByCategory);

// Basic CRUD operations
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.patch('/:id', productController.patchProduct);
router.delete('/:id', productController.deleteProduct);

// Rating functionality
router.post('/:id/rate', productController.rateProduct);
router.get('/:id/ratings', productController.getProductRatings);

// Sales functionality
router.post('/:id/increment-sales', productController.incrementSales);

module.exports = router; 