// Script to forcefully update admin password
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const NEW_PASSWORD = 'BharatMangaonkarLovesNeha@686800';

async function fixAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find admin
        const admin = await User.findOne({ email: 'bharatmangaonkar1999@gmail.com' });

        if (!admin) {
            console.log('❌ Admin not found!');
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log('Found admin:', admin.email);

        // Generate new password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

        // Directly update in database (bypasses any pre-save hooks)
        await User.updateOne(
            { _id: admin._id },
            { $set: { password: hashedPassword } }
        );

        console.log('✅ Password updated directly in database');

        // Verify the update worked
        const updatedAdmin = await User.findById(admin._id).select('+password');
        const isMatch = await bcrypt.compare(NEW_PASSWORD, updatedAdmin.password);
        console.log(`🔑 Verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);

        if (isMatch) {
            console.log('\n========================================');
            console.log('🔐 ADMIN CREDENTIALS CONFIRMED:');
            console.log('========================================');
            console.log('📧 Email: BharatMangaonkar1999@gmail.com');
            console.log('🔑 Password: BharatMangaonkarLovesNeha@686800');
            console.log('========================================\n');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixAdminPassword();
