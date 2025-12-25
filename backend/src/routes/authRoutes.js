import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, protect } from '../middleware/authMiddleware.js';
import { ValidationError, AuthError, NotFoundError, ConflictError } from '../middleware/errorMiddleware.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new student (returns token for auto-login)
// @access  Public
router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, email, mobile, password, gender, age, status, targetExam, city, avatar } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        // Check if same firstName + lastName combination already exists (case-insensitive)
        const existingNameUser = await User.findOne({
            firstName: { $regex: new RegExp(`^${firstName.trim()}$`, 'i') },
            lastName: { $regex: new RegExp(`^${lastName.trim()}$`, 'i') }
        });
        if (existingNameUser) {
            throw new ConflictError('An account with this name already exists. Please use a different name or contact support if this is your account.');
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            mobile,
            password,
            gender,
            age,
            status,
            targetExam,
            city,
            avatar: avatar || null,
            role: 'student',
        });

        // Generate token for auto-login after registration
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: user.getPublicProfile(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Login user (student or admin - admin is hidden)
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        // First, check if this email belongs to an admin
        let user = await User.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');

        // If not admin, check for student
        if (!user) {
            user = await User.findOne({ email: email.toLowerCase(), role: 'student' }).select('+password');
        }

        if (!user) {
            throw new AuthError('Invalid login credentials');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AuthError('Invalid login credentials');
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                user: user.getPublicProfile(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/admin/login
// @desc    Login admin
// @access  Public
router.post('/admin/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            throw new ValidationError('Username and password are required');
        }

        // Find admin user
        const user = await User.findOne({
            $or: [{ email: username.toLowerCase() }, { firstName: username }],
            role: 'admin'
        }).select('+password');

        if (!user) {
            throw new AuthError('Invalid credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AuthError('Invalid credentials');
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                user: user.getPublicProfile(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset - sends email with reset link
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new ValidationError('Email is required');
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // SECURITY: Always return success message to prevent email enumeration
        // But only actually send email if user exists
        if (user) {
            // Generate secure random token (32 bytes = 64 hex chars)
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Hash token before storing in database
            const hashedToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            // Save hashed token with 15-minute expiry
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            // Build reset URL with raw token (not hashed)
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

            // Send email (will fallback to console if not configured)
            await sendPasswordResetEmail(email, resetUrl, user.firstName);
        }

        // Always return success (don't reveal if email exists)
        res.json({
            success: true,
            message: 'If an account with that email exists, you will receive a password reset link.',
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/reset-password/:token
// @desc    Validate reset token (check if valid and not expired)
// @access  Public
router.get('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;

        // Hash the incoming token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new ValidationError('Password reset link is invalid or has expired');
        }

        res.json({
            success: true,
            message: 'Token is valid',
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        // Hash the incoming token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new ValidationError('Password reset link is invalid or has expired');
        }

        // Update password and clear reset token (single-use)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.',
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    res.json({
        success: true,
        data: req.user.getPublicProfile(),
    });
});

// @route   PUT /api/auth/profile
// @desc    Update profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
    try {
        // ADMIN PROTECTION: Prevent modification of critical admin fields
        const isAdmin = req.user.role === 'admin';

        // Fields that can be updated (avatar allowed for UX)
        let allowedUpdates = ['firstName', 'lastName', 'mobile', 'age', 'status', 'avatar', 'targetExam', 'city'];

        // If admin, restrict which fields can be changed (only cosmetic ones)
        if (isAdmin) {
            allowedUpdates = ['avatar']; // Admin can only change avatar
        }

        const updates = {};

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

        res.json({
            success: true,
            data: user.getPublicProfile(),
        });
    } catch (error) {
        next(error);
    }
});

export default router;
