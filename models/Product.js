const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    image: { type: String },
    category: { type: String, required: true },
    salesCount: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratings: [ratingSchema],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    if (this.discount && this.discount > 0) {
        return this.price - (this.price * this.discount / 100);
    }
    return this.price;
});

// Virtual for discount percentage
productSchema.virtual('hasDiscount').get(function() {
    return this.discount > 0;
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
    if (this.ratingCount === 0) {
        this.averageRating = 0;
    } else {
        this.averageRating = this.totalRating / this.ratingCount;
    }
    return this.averageRating;
};

// Method to add rating
productSchema.methods.addRating = function(userId, rating, comment = '') {
    // Check if user already rated
    const existingRatingIndex = this.ratings.findIndex(r => r.userId.toString() === userId.toString());
    
    if (existingRatingIndex !== -1) {
        // Update existing rating
        const oldRating = this.ratings[existingRatingIndex].rating;
        this.totalRating = this.totalRating - oldRating + rating;
        this.ratings[existingRatingIndex] = { userId, rating, comment, createdAt: new Date() };
    } else {
        // Add new rating
        this.ratings.push({ userId, rating, comment });
        this.totalRating += rating;
        this.ratingCount += 1;
    }
    
    this.calculateAverageRating();
    this.updatedAt = new Date();
    return this.save();
};

// Method to increment sales count
productSchema.methods.incrementSales = function(quantity = 1) {
    this.salesCount += quantity;
    this.updatedAt = new Date();
    return this.save();
};

// Pre-save middleware to ensure updatedAt is set
productSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Product', productSchema); 