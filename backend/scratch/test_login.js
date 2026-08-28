import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const testLogin = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edusphere';
    await mongoose.connect(connStr);
    console.log('[Test Login] Connected to database');

    const user = await User.findOne({ email: 'student@edusphere.com' }).select('+password');
    if (!user) {
      console.log('[Test Login Result]: USER NOT FOUND in DB. Database needs seeding!');
      process.exit(1);
    }

    const isMatch = await user.matchPassword('stud123');
    console.log('[Test Login Result]: User Found!', user.email, 'Role:', user.role);
    console.log('[Test Login Result]: Password match for "stud123":', isMatch);

    process.exit(0);
  } catch (err) {
    console.error('[Test Login Error]:', err.message);
    process.exit(1);
  }
};

testLogin();
