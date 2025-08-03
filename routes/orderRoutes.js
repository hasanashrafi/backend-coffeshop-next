const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order management
router.post('/', orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId/status', orderController.updateOrderStatus);
router.delete('/:orderId', orderController.cancelOrder);

// Order statistics and summaries
router.get('/user/:userId/summary', orderController.getOrderStatusSummary);
router.get('/user/:userId/recent', orderController.getRecentOrders);
router.get('/user/:userId/statistics', orderController.getOrderStatistics);

module.exports = router; 