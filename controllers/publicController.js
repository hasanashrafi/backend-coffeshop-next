const fs = require('fs').promises;
const path = require('path');

exports.aboutUs = async (req, res) => {
    try {
        const dbPath = path.join(__dirname, '../db.json');
        const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
        res.json({
            success: true,
            title: 'درباره ما',
            content: db.aboutUs || ''
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error reading About Us', error: err.message });
    }
};

exports.contactUs = async (req, res) => {
    try {
        const dbPath = path.join(__dirname, '../db.json');
        const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
        res.json({
            success: true,
            title: 'تماس با ما',
            content: db.contactUs || ''
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error reading Contact Us', error: err.message });
    }
}; 