// Script to verify admin account exists
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

async function verifyAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('📍 Database:', process.env.MONGODB_URI.split('@')[1]?.split('/')[0] || 'unknown');

        // Find admin by email
        const admin = await User.findOne({
            email: 'bharatmangaonkar1999@gmail.com'
        }).select('+password');

        if (!admin) {
            console.log('❌ Admin account NOT found in database!');
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log('\n✅ Admin account found:');
        console.log(`   - ID: ${admin._id}`);
        console.log(`   - Email: ${admin.email}`);
        console.log(`   - Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`   - Role: ${admin.role}`);
        console.log(`   - Password hash exists: ${!!admin.password}`);

        // Test password
        const testPassword = 'BharatMangaonkarLovesNeha@686800';
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log(`\n🔑 Password verification: ${isMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyAdmin();
