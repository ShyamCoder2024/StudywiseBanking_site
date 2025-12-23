import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't include password in queries by default
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    age: {
        type: Number,
        required: true,
        min: 16,
        max: 60,
    },
    status: {
        type: String,
        enum: ['preparing_fulltime', 'student', 'working_professional', 'other'],
        required: true,
    },
    targetExam: {
        type: String,
        required: [true, 'Target exam is required'],
        trim: true,
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    avatar: {
        id: String,
        url: String
    },
    // Enrollment & Payment Status
    enrollment: {
        isPaid: {
            type: Boolean,
            default: false
        },
        courses: [{
            courseId: String,
            courseName: String,
            batch: String,
            enrolledAt: {
                type: Date,
                default: Date.now
            }
        }],
        tags: [{
            type: String
        }]
    },
    // Performance Tracking
    xpPoints: {
        type: Number,
        default: 0,
    },
    streakCount: {
        type: Number,
        default: 0,
    },
    lastActivityDate: {
        type: Date,
        default: null,
    },
    // Password reset token (hashed)
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true,
});


// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
    return {
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        mobile: this.mobile,
        gender: this.gender,
        age: this.age,
        status: this.status,
        targetExam: this.targetExam,
        city: this.city,
        role: this.role,
        avatar: this.avatar,
        xpPoints: this.xpPoints || 0,
        streakCount: this.streakCount || 0,
        lastActivityDate: this.lastActivityDate,
    };
};


const User = mongoose.model('User', userSchema);

export default User;
