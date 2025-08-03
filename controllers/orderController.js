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
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID
 *         quantity:
 *           type: number
 *           description: Quantity of the product
 *     OrderStatus:
 *       type: string
 *       enum: [pending, processing, completed, delivered, cancelled]
 *       description: Order status values
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   phone:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 default: cash
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/OrderStatus'
 *         description: Filter by order status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/OrderStatus'
 *               note:
 *                 type: string
 *                 description: Optional note for status change
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/user/{userId}/summary:
 *   get:
 *     summary: Get order status summary
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Order status summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 *                     processing:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 *                     completed:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 *                     delivered:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 *                     cancelled:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/user/{userId}/recent:
 *   get:
 *     summary: Get recent orders
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recent orders to retrieve
 *     responses:
 *       200:
 *         description: Recent orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productName:
 *                               type: string
 *                             quantity:
 *                               type: number
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     summary: Cancel order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Order cannot be cancelled
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/orders/user/{userId}/statistics:
 *   get:
 *     summary: Get order statistics
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                     totalSpent:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     loyaltyPoints:
 *                       type: integer
 *       500:
 *         description: Server error
 */
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