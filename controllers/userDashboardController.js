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
 *           description: User statistics
 *         recentOrders:
 *           type: array
 *           description: Recent orders
 *         favoriteProducts:
 *           type: array
 *           description: User's favorite products
 */

// Get user dashboard data
exports.getUserDashboard = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user with populated favorite products
        const user = await User.findById(userId)
            .populate('favoriteProducts', 'name image price discount averageRating');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
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

        // Get recent orders
        const recentOrders = await Order.find({ userId })
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 })
            .limit(3)
            .select('orderNumber status createdAt items');

        // Get order status summary
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
                totalSpent: stats[0]?.totalSpent || 0,
                totalOrders: stats[0]?.totalOrders || 0,
                averageOrderValue: stats[0]?.averageOrderValue || 0
            },
            recentOrders: recentOrders.map(order => ({
                orderNumber: order.orderNumber,
                status: order.status,
                createdAt: order.createdAt,
                items: order.items.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity
                }))
            })),
            orderStatusSummary,
            favoriteProducts: user.favoriteProducts.map(product => ({
                _id: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                discount: product.discount,
                discountedPrice: product.discountedPrice,
                hasDiscount: product.hasDiscount,
                averageRating: product.averageRating
            }))
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

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
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

// Update user profile
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

// Get user statistics
exports.getUserStatistics = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

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

        const statistics = {
            loyaltyPoints: user.loyaltyPoints,
            favoriteProductsCount: user.favoriteProducts.length,
            totalOrders: stats[0]?.totalOrders || 0,
            totalSpent: stats[0]?.totalSpent || 0,
            averageOrderValue: stats[0]?.averageOrderValue || 0
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

// Get user favorite products
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

// Add product to favorites
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

// Remove product from favorites
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

// Check if product is favorite
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