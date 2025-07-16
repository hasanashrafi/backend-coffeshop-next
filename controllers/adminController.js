const fs = require('fs').promises;
const path = require('path');

exports.dashboard = (req, res) => {
    res.json({ success: true, message: 'Admin dashboard overview' });
};

exports.getProducts = (req, res) => {
    res.json({ success: true, message: 'Get all products (admin)' });
};
exports.createProduct = (req, res) => {
    res.json({ success: true, message: 'Create product (admin)' });
};
exports.updateProduct = (req, res) => {
    res.json({ success: true, message: 'Update product (admin)' });
};
exports.deleteProduct = (req, res) => {
    res.json({ success: true, message: 'Delete product (admin)' });
};

exports.getTickets = (req, res) => {
    res.json({ success: true, message: 'Get all tickets (admin)' });
};
exports.createTicket = (req, res) => {
    res.json({ success: true, message: 'Create ticket (admin)' });
};
exports.deleteTicket = (req, res) => {
    res.json({ success: true, message: 'Delete ticket (admin)' });
};

exports.getComments = (req, res) => {
    res.json({ success: true, message: 'Get all comments (admin)' });
};
exports.deleteComment = (req, res) => {
    res.json({ success: true, message: 'Delete comment (admin)' });
};

exports.getDeliveries = (req, res) => {
    res.json({ success: true, message: 'Get all deliveries (admin)' });
};
exports.createDelivery = (req, res) => {
    res.json({ success: true, message: 'Create delivery (admin)' });
};
exports.updateDelivery = (req, res) => {
    res.json({ success: true, message: 'Update delivery (admin)' });
};
exports.deleteDelivery = (req, res) => {
    res.json({ success: true, message: 'Delete delivery (admin)' });
};

exports.setDiscount = (req, res) => {
    res.json({ success: true, message: 'Set discount on product (admin)' });
};

// Edit About Us
exports.editAboutUs = async (req, res) => {
    try {
        const dbPath = path.join(__dirname, '../db.json');
        const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
        db.aboutUs = req.body.content;
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        res.json({ success: true, message: 'About Us updated', content: db.aboutUs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating About Us', error: err.message });
    }
};

// Edit Contact Us
exports.editContactUs = async (req, res) => {
    try {
        const dbPath = path.join(__dirname, '../db.json');
        const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
        db.contactUs = req.body.content;
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        res.json({ success: true, message: 'Contact Us updated', content: db.contactUs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating Contact Us', error: err.message });
    }
}; 