// Script to reset admin account with new credentials
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const NEW_ADMIN = {
    email: 'BharatMangaonkar1999@gmail.com',
    password: 'BharatMangaonkarLovesNeha@686800',
    firstName: 'Bharat',
    lastName: 'Mangaonkar',
    role: 'admin'
};

async function resetAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete ALL existing admin accounts
        const deleteResult = await User.deleteMany({ role: 'admin' });
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing admin account(s)`);

        // Hash the new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(NEW_ADMIN.password, salt);

        // Create new admin with all required fields
        const newAdmin = new User({
            email: NEW_ADMIN.email.toLowerCase(),
            password: hashedPassword,
            firstName: NEW_ADMIN.firstName,
            lastName: NEW_ADMIN.lastName,
            role: 'admin',
            isVerified: true,
            // Required fields with valid enum values for admin
            mobile: '9999999999',
            age: 25,
            gender: 'male',
            city: 'Pune',
            targetExam: 'ibps-po',
            status: 'preparing_fulltime'  // Valid enum value
        });

        await newAdmin.save();
        console.log('✅ New admin account created successfully!');
        console.log('\n========================================');
        console.log('🔐 NEW ADMIN CREDENTIALS:');
        console.log('========================================');
        console.log(`📧 Email: ${NEW_ADMIN.email}`);
        console.log(`🔑 Password: ${NEW_ADMIN.password}`);
        console.log('========================================\n');

        await mongoose.disconnect();
        console.log('✅ Done! You can now login with the new admin credentials.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetAdmin();
