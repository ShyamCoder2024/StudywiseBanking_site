// Database Index Optimization Script
// Run this once to create indexes for faster queries

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createIndexes() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Users Collection Indexes
        console.log('\n📦 Creating User indexes...');
        await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
        await db.collection('users').createIndex({ role: 1 }, { background: true });
        await db.collection('users').createIndex({ xpPoints: -1 }, { background: true });
        await db.collection('users').createIndex({ 'enrollment.isPaid': 1 }, { background: true });
        console.log('   ✅ User indexes created');

        // Attempts Collection Indexes (most frequently queried)
        console.log('\n📦 Creating Attempt indexes...');
        await db.collection('attempts').createIndex({ user: 1, createdAt: -1 }, { background: true });
        await db.collection('attempts').createIndex({ quiz: 1 }, { background: true });
        await db.collection('attempts').createIndex({ user: 1, submittedAt: 1 }, { background: true });
        await db.collection('attempts').createIndex({ submittedAt: 1 }, { background: true });
        console.log('   ✅ Attempt indexes created');

        // Quizzes Collection Indexes
        console.log('\n📦 Creating Quiz indexes...');
        await db.collection('quizzes').createIndex({ isPublished: 1, createdAt: -1 }, { background: true });
        await db.collection('quizzes').createIndex({ subject: 1 }, { background: true });
        await db.collection('quizzes').createIndex({ topic: 1 }, { background: true });
        console.log('   ✅ Quiz indexes created');

        // Questions Collection Indexes
        console.log('\n📦 Creating Question indexes...');
        await db.collection('questions').createIndex({ quiz: 1, order: 1 }, { background: true });
        console.log('   ✅ Question indexes created');

        // Courses Collection Indexes
        console.log('\n📦 Creating Course indexes...');
        await db.collection('courses').createIndex({ isPublished: 1, displayOrder: 1 }, { background: true });
        await db.collection('courses').createIndex({ subject: 1 }, { background: true });
        console.log('   ✅ Course indexes created');

        // Tasks Collection Indexes
        console.log('\n📦 Creating Task indexes...');
        await db.collection('tasks').createIndex({ assignedTo: 1, createdAt: -1 }, { background: true });
        await db.collection('globaltasks').createIndex({ isActive: 1, createdAt: -1 }, { background: true });
        console.log('   ✅ Task indexes created');

        // Notifications Collection Indexes
        console.log('\n📦 Creating Notification indexes...');
        await db.collection('notifications').createIndex({ user: 1, createdAt: -1 }, { background: true });
        await db.collection('notifications').createIndex({ user: 1, isRead: 1 }, { background: true });
        console.log('   ✅ Notification indexes created');

        // Subjects and Topics
        console.log('\n📦 Creating Subject/Topic indexes...');
        await db.collection('subjects').createIndex({ name: 1 }, { background: true });
        await db.collection('topics').createIndex({ subject: 1 }, { background: true });
        console.log('   ✅ Subject/Topic indexes created');

        console.log('\n✅ All indexes created successfully!');
        console.log('🚀 Database is now optimized for faster queries\n');

        // Show index stats
        console.log('📊 Index Statistics:');
        const collections = ['users', 'attempts', 'quizzes', 'questions', 'courses', 'tasks', 'notifications'];
        for (const collName of collections) {
            try {
                const indexes = await db.collection(collName).indexes();
                console.log(`   ${collName}: ${indexes.length} indexes`);
            } catch (e) {
                // Collection might not exist
            }
        }

    } catch (error) {
        console.error('❌ Error creating indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

createIndexes();
