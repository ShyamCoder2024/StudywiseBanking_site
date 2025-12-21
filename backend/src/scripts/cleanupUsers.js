// Script to remove all non-admin users from the database
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function cleanupUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Count users before cleanup
        const totalBefore = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const nonAdminCount = totalBefore - adminCount;

        console.log(`📊 Current users: ${totalBefore} total (${adminCount} admin, ${nonAdminCount} non-admin)`);

        // Delete all non-admin users
        const result = await User.deleteMany({ role: { $ne: 'admin' } });

        console.log(`🗑️  Deleted ${result.deletedCount} non-admin users`);

        // Verify cleanup
        const totalAfter = await User.countDocuments();
        console.log(`✅ Remaining users: ${totalAfter} (admins only)`);

        // List remaining admin accounts
        const admins = await User.find({ role: 'admin' }).select('email firstName lastName');
        console.log('\n👤 Admin accounts:');
        admins.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.firstName} ${admin.lastName})`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Done! Database cleaned up successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

cleanupUsers();
