const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserDashboard:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           description: User profile information
 *         statistics:
 *           type: object
 *           description: User statistics (loyalty points, favorites, total spent, orders)
 *         recentOrders:
 *           type: array
 *           description: Recent orders with status
 *         orderStatusSummary:
 *           type: object
 *           description: Order status breakdown with amounts
 *         favoriteProducts:
 *           type: array
 *           description: User's favorite products
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         fullName:
 *           type: string
 *         displayName:
 *           type: string
 *         avatar:
 *           type: string
 *         phone:
 *           type: string
 *         loyaltyPoints:
 *           type: number
 *         totalSpent:
 *           type: number
 *         totalOrders:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *     UserStatistics:
 *       type: object
 *       properties:
 *         loyaltyPoints:
 *           type: number
 *         favoriteProductsCount:
 *           type: number
 *         totalOrders:
 *           type: number
 *         totalSpent:
 *           type: number
 *         averageOrderValue:
 *           type: number
 */

/**
 * @swagger
 * /api/dashboard/{userId}:
 *   get:
 *     summary: Get complete user dashboard data (profile, statistics, orders, favorites)
 *     tags: [User Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Complete dashboard data retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *                     statistics:
 *                       $ref: '#/components/schemas/UserStatistics'
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orderNumber:
 *                             type: string
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 productName:
 *                                   type: string
 *                                 quantity:
 *                                   type: number
 *                     orderStatusSummary:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                             totalAmount:
 *                               type: number
 *                         processing:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                             totalAmount:
 *                               type: number
 *                         completed:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                             totalAmount:
 *                               type: number
 *                         delivered:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                             totalAmount:
 *                               type: number
 *                         cancelled:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                             totalAmount:
 *                               type: number
 *                     favoriteProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                           price:
 *                             type: number
 *                           discount:
 *                             type: number
 *                           discountedPrice:
 *                             type: number
 *                           hasDiscount:
 *                             type: boolean
 *                           averageRating:
 *                             type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.getUserDashboard = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if userId is a valid ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Get user with populated favorite products
        const user = await User.findById(userId)
            .populate('favoriteProducts', 'name image price discount averageRating ratingCount salesCount');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics from orders
        let stats = [];
        try {
            stats = await Order.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalSpent: { $sum: '$totalAmount' },
                        averageOrderValue: { $avg: '$totalAmount' }
                    }
                }
            ]);
        } catch (error) {
            console.error('Error in order statistics aggregation:', error);
            stats = [{ totalOrders: 0, totalSpent: 0, averageOrderValue: 0 }];
        }

        // Get recent orders (last 3 orders)
        let recentOrders = [];
        try {
            recentOrders = await Order.find({ userId })
                .populate('items.productId', 'name image')
                .sort({ createdAt: -1 })
                .limit(3)
                .select('orderNumber status createdAt items');
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            recentOrders = [];
        }

        // Get order status summary with amounts
        let statusSummary = [];
        try {
            statusSummary = await Order.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                }
            ]);
        } catch (error) {
            console.error('Error in order status summary aggregation:', error);
            statusSummary = [];
        }

        const orderStatusSummary = {
            pending: { count: 0, totalAmount: 0 },
            processing: { count: 0, totalAmount: 0 },
            completed: { count: 0, totalAmount: 0 },
            delivered: { count: 0, totalAmount: 0 },
            cancelled: { count: 0, totalAmount: 0 }
        };

        statusSummary.forEach(item => {
            orderStatusSummary[item._id] = {
                count: item.count,
                totalAmount: item.totalAmount
            };
        });

        // Format recent orders for display
        const formattedRecentOrders = recentOrders.map(order => ({
            orderNumber: order.orderNumber,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items.map(item => ({
                productName: item.productName,
                quantity: item.quantity
            }))
        }));

        // Format favorite products with virtual fields
        const favoriteProducts = user.favoriteProducts.map(product => ({
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            discount: product.discount,
            discountedPrice: product.discountedPrice,
            hasDiscount: product.hasDiscount,
            averageRating: product.averageRating,
            ratingCount: product.ratingCount,
            salesCount: product.salesCount
        }));

        const dashboardData = {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                displayName: user.displayName,
                avatar: user.avatar,
                phone: user.phone,
                loyaltyPoints: user.loyaltyPoints,
                totalSpent: user.totalSpent,
                totalOrders: user.totalOrders,
                createdAt: user.createdAt,
                address: user.address
            },
            statistics: {
                loyaltyPoints: user.loyaltyPoints,
                favoriteProductsCount: user.favoriteProducts.length,
                totalOrders: stats[0]?.totalOrders || 0,
                totalSpent: stats[0]?.totalSpent || 0,
                averageOrderValue: stats[0]?.averageOrderValue || 0
            },
            recentOrders: formattedRecentOrders,
            orderStatusSummary,
            favoriteProducts
        };

        res.json({
            success: true,
            data: dashboardData
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
 * /api/dashboard/{userId}/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Remove sensitive fields from update
        delete updateData.password;
        delete updateData.email; // Email should be updated separately
        delete updateData.loyaltyPoints;
        delete updateData.totalSpent;
        delete updateData.totalOrders;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                displayName: user.displayName,
                avatar: user.avatar,
                phone: user.phone,
                loyaltyPoints: user.loyaltyPoints,
                totalSpent: user.totalSpent,
                totalOrders: user.totalOrders,
                createdAt: user.createdAt,
                address: user.address,
                preferences: user.preferences
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
 * /api/dashboard/{userId}/favorites:
 *   get:
 *     summary: Get user favorite products
 *     tags: [User Dashboard]
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
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Favorite products retrieved successfully
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
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                       price:
 *                         type: number
 *                       discount:
 *                         type: number
 *                       discountedPrice:
 *                         type: number
 *                       hasDiscount:
 *                         type: boolean
 *                       averageRating:
 *                         type: number
 *                       ratingCount:
 *                         type: number
 *                       salesCount:
 *                         type: number
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalProducts:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.getUserFavoriteProducts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const user = await User.findById(userId).populate({
            path: 'favoriteProducts',
            select: 'name image price discount averageRating ratingCount salesCount',
            options: {
                skip: (page - 1) * limit,
                limit: parseInt(limit)
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const favoriteProducts = user.favoriteProducts.map(product => ({
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            discount: product.discount,
            discountedPrice: product.discountedPrice,
            hasDiscount: product.hasDiscount,
            averageRating: product.averageRating,
            ratingCount: product.ratingCount,
            salesCount: product.salesCount
        }));

        res.json({
            success: true,
            data: favoriteProducts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(user.favoriteProducts.length / limit),
                totalProducts: user.favoriteProducts.length,
                hasNext: page * limit < user.favoriteProducts.length,
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
 * /api/dashboard/{userId}/favorites/{productId}:
 *   post:
 *     summary: Add product to favorites
 *     tags: [User Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product added to favorites successfully
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
 *                   type: object
 *                   properties:
 *                     favoriteProductsCount:
 *                       type: number
 *       404:
 *         description: User or product not found
 *       500:
 *         description: Server error
 */
exports.addToFavorites = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await user.addFavoriteProduct(productId);

        res.json({
            success: true,
            message: 'Product added to favorites successfully',
            data: {
                favoriteProductsCount: user.favoriteProducts.length
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
 * /api/dashboard/{userId}/favorites/{productId}:
 *   delete:
 *     summary: Remove product from favorites
 *     tags: [User Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from favorites successfully
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
 *                   type: object
 *                   properties:
 *                     favoriteProductsCount:
 *                       type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.removeFromFavorites = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.removeFavoriteProduct(productId);

        res.json({
            success: true,
            message: 'Product removed from favorites successfully',
            data: {
                favoriteProductsCount: user.favoriteProducts.length
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
 * /api/dashboard/{userId}/favorites/{productId}/check:
 *   get:
 *     summary: Check if product is in favorites
 *     tags: [User Dashboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Favorite status checked successfully
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
 *                     isFavorite:
 *                       type: boolean
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.checkFavoriteStatus = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isFavorite = user.isFavoriteProduct(productId);

        res.json({
            success: true,
            data: {
                isFavorite
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 