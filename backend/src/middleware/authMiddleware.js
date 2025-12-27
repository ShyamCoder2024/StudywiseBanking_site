import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthError, ForbiddenError } from './errorMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'studywisebanking-secret-key-change-in-production';

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT and attach user to request
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AuthError('No authentication token provided');
        }

        // DEMO BYPASS: Allow specific demo token for easy admin access
        if (token === 'demo-admin-token') {
            req.user = {
                _id: 'demo-admin-123',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@studywise.com',
                role: 'admin',
                isAdmin: true
            };
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        // OPTIMIZED: Use lean() and select only fields needed for auth
        const user = await User.findById(decoded.id)
            .select('firstName lastName email role xpPoints streakCount avatar enrollment targetExam')
            .lean();

        if (!user) {
            throw new AuthError('User not found');
        }

        // Add _id back since lean() returns plain object
        user._id = decoded.id;
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(error);
        } else if (error instanceof AuthError) {
            next(error);
        } else {
            next(new AuthError('Authentication failed'));
        }
    }
};

// Restrict to admin only
export const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return next(new ForbiddenError('Admin access required'));
    }
    next();
};

// Restrict to students only
export const studentOnly = (req, res, next) => {
    if (req.user?.role !== 'student') {
        return next(new ForbiddenError('Student access required'));
    }
    next();
};

export default { protect, adminOnly, studentOnly, generateToken };
