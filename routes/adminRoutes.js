const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overview
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard overview
 */
// Dashboard
router.get('/dashboard', adminAuth, adminController.dashboard);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Product created
 */
// Products CRUD
router.get('/products', adminAuth, adminController.getProducts);
router.post('/products', adminAuth, adminController.createProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update a product (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.put('/products/:id', adminAuth, adminController.updateProduct);
router.delete('/products/:id', adminAuth, adminController.deleteProduct);

/**
 * @swagger
 * /api/admin/tickets:
 *   get:
 *     summary: Get all tickets (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *   post:
 *     summary: Create a new ticket (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ticket created
 */
// Tickets
router.get('/tickets', adminAuth, adminController.getTickets);
router.post('/tickets', adminAuth, adminController.createTicket);

/**
 * @swagger
 * /api/admin/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted
 */
router.delete('/tickets/:id', adminAuth, adminController.deleteTicket);

/**
 * @swagger
 * /api/admin/comments:
 *   get:
 *     summary: Get all comments (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of comments
 */
// Comments
router.get('/comments', adminAuth, adminController.getComments);

/**
 * @swagger
 * /api/admin/comments/{id}:
 *   delete:
 *     summary: Delete a comment (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete('/comments/:id', adminAuth, adminController.deleteComment);

/**
 * @swagger
 * /api/admin/deliveries:
 *   get:
 *     summary: Get all deliveries (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deliveries
 *   post:
 *     summary: Create a new delivery (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Delivery created
 */
// Deliveries
router.get('/deliveries', adminAuth, adminController.getDeliveries);
router.post('/deliveries', adminAuth, adminController.createDelivery);

/**
 * @swagger
 * /api/admin/deliveries/{id}:
 *   put:
 *     summary: Update a delivery (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Delivery updated
 *   delete:
 *     summary: Delete a delivery (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery deleted
 */
router.put('/deliveries/:id', adminAuth, adminController.updateDelivery);
router.delete('/deliveries/:id', adminAuth, adminController.deleteDelivery);

/**
 * @swagger
 * /api/admin/discount/{id}:
 *   post:
 *     summary: Set discount on a product (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Discount set
 */
// Set discount on product
router.post('/discount/:id', adminAuth, adminController.setDiscount);

/**
 * @swagger
 * /api/admin/about-us:
 *   put:
 *     summary: Edit About Us content (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: About Us updated
 */
// Edit About Us and Contact Us
router.put('/about-us', adminAuth, adminController.editAboutUs);

/**
 * @swagger
 * /api/admin/contact-us:
 *   put:
 *     summary: Edit Contact Us content (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact Us updated
 */
router.put('/contact-us', adminAuth, adminController.editContactUs);

module.exports = router; 