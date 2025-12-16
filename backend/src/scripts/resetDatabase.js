/**
 * Database Reset Script
 * Clears all user accounts and creates the permanent admin account.
 * 
 * Run with: node src/scripts/resetDatabase.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Admin credentials - HARDCODED and PERMANENT
const ADMIN_EMAIL = 'bharatmangaonkar1@gmail.com';
const ADMIN_PASSWORD = 'BharatMangaonkar@6868001999';
const ADMIN_FIRST_NAME = 'Bharat';
const ADMIN_LAST_NAME = 'Mangaonkar';

async function resetDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/studywisebanking';
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get User model
        const User = mongoose.model('User', new mongoose.Schema({
            firstName: String,
            lastName: String,
            email: String,
            mobile: String,
            password: String,
            gender: String,
            age: Number,
            status: String,
            targetExam: String,
            city: String,
            role: String,
            avatar: { id: String, url: String },
            resetOTP: String,
            resetOTPExpiry: Date,
        }, { timestamps: true, strict: false }));

        // Step 1: Delete ALL users
        console.log('🗑️  Deleting all existing users...');
        const deleteResult = await User.deleteMany({});
        console.log(`   Deleted ${deleteResult.deletedCount} users.`);

        // Step 2: Create permanent admin account
        console.log('👤 Creating permanent admin account...');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        const admin = await User.create({
            firstName: ADMIN_FIRST_NAME,
            lastName: ADMIN_LAST_NAME,
            email: ADMIN_EMAIL.toLowerCase(),
            mobile: '9999999999',
            password: hashedPassword,
            gender: 'male',
            age: 30,
            status: 'working_professional',
            targetExam: 'admin',
            city: 'Admin City',
            role: 'admin',
        });

        console.log('✅ Admin account created successfully!');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Role:', admin.role);
        console.log('');
        console.log('🔒 Database has been reset. Only the admin account exists now.');

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetDatabase();
