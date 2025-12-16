
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config({ path: '../.env' });

const checkAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/studywisebanking';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const adminUser = await User.findOne({ role: 'admin' });

        if (adminUser) {
            console.log('✅ Admin user found:');
            console.log(`Email: ${adminUser.email}`);
            // We can't show the password, but we assume the user knows it or we can reset it if needed.
            // For now, let's just confirm existence.
        } else {
            console.log('⚠️ No admin user found. Creating one...');

            const newAdmin = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@studywise.com',
                mobile: '9999999999',
                password: 'admin123', // Default password
                gender: 'other',
                age: 30,
                status: 'other',
                role: 'admin'
            });

            await newAdmin.save();
            console.log('✅ Admin user created successfully');
            console.log('Email: admin@studywise.com');
            console.log('Password: admin123');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkAdmin();
