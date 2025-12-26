/**
 * Migration Script: Publish All Existing Courses
 * 
 * Problem: Courses created before isPublished default change are invisible to students
 * Solution: Update all existing courses to set isPublished = true
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

async function publishAllCourses() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Find all courses where isPublished is false or undefined
        const result = await Course.updateMany(
            { $or: [{ isPublished: false }, { isPublished: { $exists: false } }] },
            { $set: { isPublished: true } }
        );

        console.log(`✅ Published ${result.modifiedCount} courses`);

        // Verify - count total published courses
        const publishedCount = await Course.countDocuments({ isPublished: true });
        const totalCount = await Course.countDocuments({});

        console.log(`📊 Total courses: ${totalCount}`);
        console.log(`📊 Published courses: ${publishedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

publishAllCourses();
