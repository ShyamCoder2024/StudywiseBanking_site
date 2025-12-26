/**
 * Check and Fix: Publish all existing courses
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

async function checkAndPublishCourses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Check all courses
        const allCourses = await Course.find({});
        console.log(`📊 Total courses in database: ${allCourses.length}\n`);

        if (allCourses.length === 0) {
            console.log('❌ NO COURSES FOUND IN DATABASE!');
            console.log('📝 Admin needs to create courses first in the admin panel.\n');
            process.exit(0);
        }

        // Show current status
        console.log('Current course status:');
        allCourses.forEach((course, idx) => {
            console.log(`${idx + 1}. "${course.title}" - isPublished: ${course.isPublished}`);
        });
        console.log('');

        // Update unpublished courses
        const result = await Course.updateMany(
            { isPublished: { $ne: true } },
            { $set: { isPublished: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} course(s) to isPublished: true\n`);

        // Verify final status
        const publishedCount = await Course.countDocuments({ isPublished: true });
        console.log(`📊 Final status: ${publishedCount}/${allCourses.length} courses published\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAndPublishCourses();
