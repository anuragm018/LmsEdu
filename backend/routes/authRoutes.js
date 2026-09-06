import express from 'express';

import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


// Authentication Routes

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Email OTP Verification
router.post('/verify-otp', verifyOTP);

// Resend OTP
router.post('/resend-otp', resendOTP);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Reset Password
router.post('/reset-password', resetPassword);


// Profile Routes


// Get Profile
router.get('/profile', protect, getUserProfile);

// Update Profile
router.put('/profile', protect, updateUserProfile);

export default router;