import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studywisebanking';

const dummyStudents = [
    { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@gmail.com', mobile: '9876543210', password: 'password123', gender: 'male', age: 22, status: 'student' },
    { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@gmail.com', mobile: '9876543211', password: 'password123', gender: 'female', age: 24, status: 'preparing_fulltime' },
    { firstName: 'Amit', lastName: 'Kumar', email: 'amit.kumar@gmail.com', mobile: '9876543212', password: 'password123', gender: 'male', age: 21, status: 'student' },
    { firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.gupta@gmail.com', mobile: '9876543213', password: 'password123', gender: 'female', age: 23, status: 'working_professional' },
    { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@gmail.com', mobile: '9876543214', password: 'password123', gender: 'male', age: 25, status: 'preparing_fulltime' },
    { firstName: 'Anjali', lastName: 'Verma', email: 'anjali.verma@gmail.com', mobile: '9876543215', password: 'password123', gender: 'female', age: 22, status: 'student' },
    { firstName: 'Rajesh', lastName: 'Yadav', email: 'rajesh.yadav@gmail.com', mobile: '9876543216', password: 'password123', gender: 'male', age: 26, status: 'working_professional' },
    { firstName: 'Pooja', lastName: 'Mehta', email: 'pooja.mehta@gmail.com', mobile: '9876543217', password: 'password123', gender: 'female', age: 24, status: 'student' },
    { firstName: 'Suresh', lastName: 'Nair', email: 'suresh.nair@gmail.com', mobile: '9876543218', password: 'password123', gender: 'male', age: 23, status: 'preparing_fulltime' },
    { firstName: 'Deepa', lastName: 'Iyer', email: 'deepa.iyer@gmail.com', mobile: '9876543219', password: 'password123', gender: 'female', age: 21, status: 'student' },
    { firstName: 'Manish', lastName: 'Joshi', email: 'manish.joshi@gmail.com', mobile: '9876543220', password: 'password123', gender: 'male', age: 27, status: 'working_professional' },
    { firstName: 'Kavita', lastName: 'Desai', email: 'kavita.desai@gmail.com', mobile: '9876543221', password: 'password123', gender: 'female', age: 22, status: 'preparing_fulltime' },
    { firstName: 'Arun', lastName: 'Pillai', email: 'arun.pillai@gmail.com', mobile: '9876543222', password: 'password123', gender: 'male', age: 24, status: 'student' },
    { firstName: 'Neha', lastName: 'Saxena', email: 'neha.saxena@gmail.com', mobile: '9876543223', password: 'password123', gender: 'female', age: 25, status: 'working_professional' },
    { firstName: 'Kiran', lastName: 'Reddy', email: 'kiran.reddy@gmail.com', mobile: '9876543224', password: 'password123', gender: 'male', age: 23, status: 'student' },
];

async function seedStudents() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        for (const student of dummyStudents) {
            // Check if student already exists
            const exists = await User.findOne({ email: student.email });
            if (!exists) {
                await User.create({ ...student, role: 'student' });
                console.log(`✅ Created student: ${student.firstName} ${student.lastName}`);
            } else {
                console.log(`⏭️  Student already exists: ${student.email}`);
            }
        }

        console.log('\n🎉 Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding students:', error);
        process.exit(1);
    }
}

seedStudents();
