module.exports = (req, res, next) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'hasoo';
    const providedPassword = req.headers['x-admin-password'];
    if (providedPassword && providedPassword === adminPassword) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized: Admin only' });
}; 