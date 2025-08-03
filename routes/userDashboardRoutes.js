const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');

// User dashboard
router.get('/:userId/dashboard', userDashboardController.getUserDashboard);
router.get('/:userId/profile', userDashboardController.getUserProfile);
router.put('/:userId/profile', userDashboardController.updateUserProfile);
router.get('/:userId/statistics', userDashboardController.getUserStatistics);

// Favorite products
router.get('/:userId/favorites', userDashboardController.getUserFavoriteProducts);
router.post('/:userId/favorites/:productId', userDashboardController.addToFavorites);
router.delete('/:userId/favorites/:productId', userDashboardController.removeFromFavorites);
router.get('/:userId/favorites/:productId/check', userDashboardController.checkFavoriteStatus);

module.exports = router; 