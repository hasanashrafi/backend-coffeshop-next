const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const fs = require('fs').promises;
const path = require('path');

// Helper function to read users from db
const readUsers = async () => {
    try {
        const data = await fs.readFile(path.join(__dirname, '../users.json'), 'utf8');
        return JSON.parse(data).users;
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
};

// Helper function to write users to db
const writeUsers = async (users) => {
    try {
        await fs.writeFile(
            path.join(__dirname, '../users.json'),
            JSON.stringify({ users }, null, 2),
            'utf8'
        );
    } catch (error) {
        console.error('Error writing users:', error);
        throw new Error('Error writing to database');
    }
};

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

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Read existing users
        const users = await readUsers();

        // Check if user already exists
        const existingUser = users.find(user =>
            user.email === email || user.username === username
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // Save user to database
        users.push(newUser);
        await writeUsers(users);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
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

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Read users from database
        const users = await readUsers();

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error signing in',
            error: error.message
        });
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

        // Read users from database
        const users = await readUsers();

        // Check if user exists
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is authorized
        if (req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this user'
            });
        }

        // Update user
        const updatedUser = {
            ...users[userIndex],
            username: username || users[userIndex].username,
            email: email || users[userIndex].email,
            updatedAt: new Date().toISOString()
        };

        // Save updated user
        users[userIndex] = updatedUser;
        await writeUsers(users);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email
                }
            }
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
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
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
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
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.userId);

        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[userIndex];
        const updates = {};

        // Update username if provided
        if (username) {
            const usernameExists = users.some(u => u.username === username && u.id !== user.id);
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }
            updates.username = username;
        }

        // Update email if provided
        if (email) {
            const emailExists = users.some(u => u.email === email && u.id !== user.id);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }
            updates.email = email;
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            updates.password = await bcrypt.hash(newPassword, 12);
        }

        // Update user
        users[userIndex] = {
            ...user,
            ...updates
        };

        await writeUsers(users);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                username: updates.username || user.username,
                email: updates.email || user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
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
        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === req.user.userId);

        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[userIndex];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // Remove user
        users.splice(userIndex, 1);
        await writeUsers(users);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting account',
            error: error.message
        });
    }
}; 