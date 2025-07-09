const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// Helper function to generate a simple token
const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

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

// Handle OPTIONS requests for CORS
router.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});

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
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/signin', async (req, res) => {
    try {
        console.log('Signin request received:', req.body);
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
        console.log('Users from database:', users);

        // Find user
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
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

        // Set CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.header('Access-Control-Allow-Credentials', 'true');

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token: user.token,
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
});

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
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/signup', async (req, res) => {
    try {
        console.log('Signup request received:', req.body);
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
            user.email.toLowerCase() === email.toLowerCase() ||
            user.username.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate token
        const token = generateToken();

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            token,
            createdAt: new Date().toISOString()
        };

        // Save user to database
        users.push(newUser);
        await writeUsers(users);

        // Set CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.header('Access-Control-Allow-Credentials', 'true');

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
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
});

module.exports = router; 