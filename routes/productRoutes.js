const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Special product lists (must come before :id routes)
router.get('/discounted/all', productController.getDiscountedProducts);
router.get('/top-rated/all', productController.getTopRatedProducts);
router.get('/best-selling/all', productController.getBestSellingProducts);

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