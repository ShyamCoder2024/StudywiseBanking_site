import express from 'express';
import User from '../models/User.js';
import { generateToken, protect } from '../middleware/authMiddleware.js';
import { ValidationError, AuthError, NotFoundError, ConflictError } from '../middleware/errorMiddleware.js';

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
// @desc    Send OTP to email
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new NotFoundError('User with this email');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP with expiry (10 minutes)
        user.resetOTP = otp;
        user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // TODO: Send OTP via email service
        // For demo, log OTP (remove in production)
        console.log(`OTP for ${email}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent to your email',
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetOTP: otp,
            resetOTPExpiry: { $gt: new Date() },
        });

        if (!user) {
            throw new ValidationError('Invalid or expired OTP');
        }

        res.json({
            success: true,
            message: 'OTP verified successfully',
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            throw new ValidationError('Password must be at least 6 characters');
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetOTP: otp,
            resetOTPExpiry: { $gt: new Date() },
        });

        if (!user) {
            throw new ValidationError('Invalid or expired OTP');
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.resetOTP = undefined;
        user.resetOTPExpiry = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful',
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
