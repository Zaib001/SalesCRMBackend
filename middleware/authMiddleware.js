// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token and extract user role
exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains { id, role } from JWT payload
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to restrict access to Admin only
exports.adminOnly = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Access denied: Admins only' });
    }
    next();
};

// Middleware to restrict access to Employees only
exports.employeeOnly = (req, res, next) => {
    if (req.user.role !== 'Employee') {
        return res.status(403).json({ msg: 'Access denied: Employees only' });
    }
    next();
};
