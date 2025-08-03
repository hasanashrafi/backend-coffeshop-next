const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - userId
 *         - items
 *         - totalAmount
 *       properties:
 *         orderNumber:
 *           type: string
 *           description: Auto-generated order number
 *         userId:
 *           type: string
 *           description: User ID who placed the order
 *         items:
 *           type: array
 *           description: Array of order items
 *         totalAmount:
 *           type: number
 *           description: Total order amount
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, delivered, cancelled]
 *           description: Order status
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 *           description: Payment status
 */

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { userId, items, deliveryAddress, paymentMethod, notes } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        // Calculate total and validate products
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.productId} not found`
                });
            }

            const itemTotal = (product.price - (product.price * (product.discount || 0) / 100)) * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                price: product.price,
                discount: product.discount || 0,
                totalPrice: itemTotal
            });

            // Increment product sales count
            await product.incrementSales(item.quantity);
        }

        // Create order
        const order = new Order({
            userId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            notes
        });

        await order.save();

        // Update user statistics
        const user = await User.findById(userId);
        if (user) {
            await user.addToTotalSpent(totalAmount);
            // Add loyalty points (1 point per 1000 toman)
            const loyaltyPoints = Math.floor(totalAmount / 1000);
            await user.addLoyaltyPoints(loyaltyPoints);
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 10, page = 1 } = req.query;

        let query = { userId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const orders = await Order.find(query)
            .populate('items.productId', 'name image price discount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders,
                hasNext: page * limit < totalOrders,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate('userId', 'username email firstName lastName')
            .populate('items.productId', 'name image price discount description');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, note } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await order.updateStatus(status, note);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get order status summary
exports.getOrderStatusSummary = async (req, res) => {
    try {
        const { userId } = req.params;

        const statusSummary = await Order.aggregate([
            { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const summary = {
            pending: { count: 0, totalAmount: 0 },
            processing: { count: 0, totalAmount: 0 },
            completed: { count: 0, totalAmount: 0 },
            delivered: { count: 0, totalAmount: 0 },
            cancelled: { count: 0, totalAmount: 0 }
        };

        statusSummary.forEach(item => {
            summary[item._id] = {
                count: item.count,
                totalAmount: item.totalAmount
            };
        });

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get recent orders
exports.getRecentOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 5 } = req.query;

        const orders = await Order.find({ userId })
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('orderNumber status createdAt items');

        const recentOrders = orders.map(order => ({
            orderNumber: order.orderNumber,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items.map(item => ({
                productName: item.productName,
                quantity: item.quantity
            }))
        }));

        res.json({
            success: true,
            data: recentOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        await order.updateStatus('cancelled', reason);

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get order statistics
exports.getOrderStatistics = async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await Order.aggregate([
            { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        const user = await User.findById(userId);
        const loyaltyPoints = user ? user.loyaltyPoints : 0;

        const statistics = {
            totalOrders: stats[0]?.totalOrders || 0,
            totalSpent: stats[0]?.totalSpent || 0,
            averageOrderValue: stats[0]?.averageOrderValue || 0,
            loyaltyPoints
        };

        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 