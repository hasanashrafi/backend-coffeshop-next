module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'Bearer admin-secret-token') {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: Admin only' });
}; 