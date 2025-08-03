const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'delivered', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
    }],
    deliveryAddress: {
        street: String,
        city: String,
        postalCode: String,
        phone: String
    },
    paymentMethod: { type: String, default: 'cash' },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Generate order number
orderSchema.pre('save', function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `${year}${month}${day}${random}`;
    }
    this.updatedAt = new Date();
    next();
});

// Method to update order status
orderSchema.methods.updateStatus = function (newStatus, note = '') {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: note
    });
    this.updatedAt = new Date();
    return this.save();
};

// Method to calculate total amount
orderSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce((total, item) => {
        const itemTotal = (item.price - (item.price * item.discount / 100)) * item.quantity;
        return total + itemTotal;
    }, 0);
    return this.totalAmount;
};

module.exports = mongoose.model('Order', orderSchema); 