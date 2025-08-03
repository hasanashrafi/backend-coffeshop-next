const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    avatar: { type: String },
    loyaltyPoints: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    address: {
        street: String,
        city: String,
        postalCode: String,
        country: String
    },
    preferences: {
        notifications: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true },
        language: { type: String, default: 'fa' }
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Virtual for display name
userSchema.virtual('displayName').get(function () {
    return this.fullName || this.username;
});

// Method to add loyalty points
userSchema.methods.addLoyaltyPoints = function (points) {
    this.loyaltyPoints += points;
    this.updatedAt = new Date();
    return this.save();
};

// Method to add to total spent
userSchema.methods.addToTotalSpent = function (amount) {
    this.totalSpent += amount;
    this.totalOrders += 1;
    this.updatedAt = new Date();
    return this.save();
};

// Method to add favorite product
userSchema.methods.addFavoriteProduct = function (productId) {
    if (!this.favoriteProducts.includes(productId)) {
        this.favoriteProducts.push(productId);
        this.updatedAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove favorite product
userSchema.methods.removeFavoriteProduct = function (productId) {
    this.favoriteProducts = this.favoriteProducts.filter(id => id.toString() !== productId.toString());
    this.updatedAt = new Date();
    return this.save();
};

// Method to check if product is favorite
userSchema.methods.isFavoriteProduct = function (productId) {
    return this.favoriteProducts.some(id => id.toString() === productId.toString());
};

// Pre-save middleware to ensure updatedAt is set
userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('User', userSchema); 