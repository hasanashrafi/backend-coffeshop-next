const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Handle preflight requests for all product routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
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