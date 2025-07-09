const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.put('/update/:userId', auth, userController.updateUser);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.delete('/profile', auth, userController.deleteProfile);

module.exports = router; 