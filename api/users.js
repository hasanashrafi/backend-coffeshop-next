const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
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

// ... existing code from userRoutes.js ...
// Copy all the route handlers from the original userRoutes.js file

module.exports = router; 