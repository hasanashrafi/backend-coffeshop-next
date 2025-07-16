const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Dashboard
router.get('/dashboard', adminAuth, adminController.dashboard);

// Products CRUD
router.get('/products', adminAuth, adminController.getProducts);
router.post('/products', adminAuth, adminController.createProduct);
router.put('/products/:id', adminAuth, adminController.updateProduct);
router.delete('/products/:id', adminAuth, adminController.deleteProduct);

// Tickets
router.get('/tickets', adminAuth, adminController.getTickets);
router.post('/tickets', adminAuth, adminController.createTicket);
router.delete('/tickets/:id', adminAuth, adminController.deleteTicket);

// Comments
router.get('/comments', adminAuth, adminController.getComments);
router.delete('/comments/:id', adminAuth, adminController.deleteComment);

// Deliveries
router.get('/deliveries', adminAuth, adminController.getDeliveries);
router.post('/deliveries', adminAuth, adminController.createDelivery);
router.put('/deliveries/:id', adminAuth, adminController.updateDelivery);
router.delete('/deliveries/:id', adminAuth, adminController.deleteDelivery);

// Set discount on product
router.post('/discount/:id', adminAuth, adminController.setDiscount);

// Edit About Us and Contact Us
router.put('/about-us', adminAuth, adminController.editAboutUs);
router.put('/contact-us', adminAuth, adminController.editContactUs);

module.exports = router; 