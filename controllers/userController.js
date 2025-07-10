const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *     UserResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             username:
 *               type: string
 *             email:
 *               type: string
 */

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully', data: { user: { id: newUser._id, username: newUser.username, email: newUser.email } } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/signin:
 *   post:
 *     summary: Sign in to an existing account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ success: true, message: 'Login successful', data: { token, user: { id: user._id, username: user.username, email: user.email } } });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ success: false, message: 'Error signing in', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/update/{userId}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to update this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email } = req.body;
        if (req.user.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { username, email, updatedAt: new Date() } },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User updated successfully', data: { user: { id: updatedUser._id, username: updatedUser.username, email: updatedUser.email } } });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
exports.updateProfile = async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (username) {
            const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
            if (usernameExists) {
                return res.status(400).json({ success: false, message: 'Username already taken' });
            }
            user.username = username;
        }
        if (email) {
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already taken' });
            }
            user.email = email;
        }
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 12);
        }
        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', data: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
exports.deleteProfile = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password is incorrect' });
        }
        await User.findByIdAndDelete(user._id);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting account', error: error.message });
    }
}; 