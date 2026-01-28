import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
import User from '../models/User.js';
import Notification from '../models/Notification.js';

async function pushUpdateNotification() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all students
        const students = await User.find({ role: 'student' }).select('_id');
        console.log(`📊 Found ${students.length} students`);

        if (students.length === 0) {
            console.log('⚠️ No students found');
            return;
        }

        // Create notification for each student
        const notifications = students.map(student => ({
            user: student._id,
            title: '🎉 App Update - Critical Fixes!',
            message: 'We\'ve fixed critical scrolling issues and improved the overall user experience. Enjoy smoother navigation across all pages!',
            type: 'success',
            link: '/dashboard',
            isRead: false,
        }));

        // Insert notifications in bulk
        const result = await Notification.insertMany(notifications);
        console.log(`✅ Successfully created ${result.length} notifications`);
        console.log('🎯 Update notification pushed to all users!');

        // Show a sample notification
        console.log('\n📋 Sample notification:');
        console.log('Title:', notifications[0].title);
        console.log('Message:', notifications[0].message);
        console.log('Type:', notifications[0].type);

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Execute the script
pushUpdateNotification()
    .then(() => {
        console.log('✨ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
