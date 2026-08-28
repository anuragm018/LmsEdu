import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const testRegister = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edusphere';
    await mongoose.connect(connStr);
    console.log('Connected to DB for registration test');

    const testEmail = `teststudent_${Date.now()}@edusphere.com`;
    const user = await User.create({
      name: 'Test Student',
      email: testEmail,
      password: 'password123',
      role: 'student'
    });

    console.log('Successfully created student user:', user._id, user.name, user.email);
    await user.deleteOne();
    console.log('Cleaned up test user');
    process.exit(0);
  } catch (err) {
    console.error('Registration Test Error:', err);
    process.exit(1);
  }
};

testRegister();
