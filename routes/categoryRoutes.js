const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Basic CRUD operations
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:slug/products', categoryController.getProductsByCategory);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.patch('/:id', categoryController.patchCategory);
router.delete('/:id', categoryController.deleteCategory);

// Special operations
router.get('/slug/:slug', categoryController.getCategoryBySlug);

module.exports = router; 