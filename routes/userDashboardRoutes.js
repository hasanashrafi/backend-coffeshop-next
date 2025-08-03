const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');

// Main user dashboard - gets all user data in one call
router.get('/:userId', userDashboardController.getUserDashboard);

// Profile management
router.put('/:userId/profile', userDashboardController.updateUserProfile);

// Favorite products management
router.get('/:userId/favorites', userDashboardController.getUserFavoriteProducts);
router.post('/:userId/favorites/:productId', userDashboardController.addToFavorites);
router.delete('/:userId/favorites/:productId', userDashboardController.removeFromFavorites);
router.get('/:userId/favorites/:productId/check', userDashboardController.checkFavoriteStatus);

module.exports = router; 