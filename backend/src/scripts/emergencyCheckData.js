/**
 * EMERGENCY: Check ALL data in database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllData() {
    try {
        console.log('🔍 Connecting to database...');
        console.log('📍 MONGODB_URI:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        // Get ALL collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📊 Collections in database:');
        collections.forEach(c => console.log(`   - ${c.name}`));
        console.log('');

        // Count documents in each collection
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`📦 ${collection.name}: ${count} documents`);
        }
        console.log('');

        // Check courses specifically
        const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
        const courses = await Course.find({}).lean();
        console.log(`\n🎓 COURSES DETAILS:`);
        if (courses.length === 0) {
            console.log('   ❌ NO COURSES FOUND');
        } else {
            courses.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.title} (${c.lectures?.length || 0} lectures)`);
            });
        }

        // Check users
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const users = await User.find({}).lean();
        console.log(`\n👥 USERS DETAILS:`);
        if (users.length === 0) {
            console.log('   ❌ NO USERS FOUND');
        } else {
            console.log(`   Total: ${users.length} users`);
            users.slice(0, 5).forEach((u, i) => {
                console.log(`   ${i + 1}. ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

checkAllData();
