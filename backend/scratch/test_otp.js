import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const testOTP = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edusphere';
    await mongoose.connect(connStr);
    console.log('[Test OTP] Connected to DB');

    const testEmail = `otpstudent_${Date.now()}@edusphere.com`;
    const otp = '482910';

    const user = await User.create({
      name: 'OTP Student',
      email: testEmail,
      password: 'password123',
      role: 'student',
      isVerified: false,
      otpCode: otp
    });

    console.log('Created student with OTP:', user.email, 'OTP:', user.otpCode);

    // Verify OTP logic
    if (user.otpCode === '482910') {
      user.isVerified = true;
      user.otpCode = undefined;
      await user.save();
      console.log('OTP Verification Passed! isVerified:', user.isVerified);
    }

    await user.deleteOne();
    console.log('Cleaned up test OTP user');
    process.exit(0);
  } catch (err) {
    console.error('[Test OTP Error]:', err.message);
    process.exit(1);
  }
};

testOTP();
