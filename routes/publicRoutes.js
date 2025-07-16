const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/about-us', publicController.aboutUs);
router.get('/contact-us', publicController.contactUs);

module.exports = router; 