import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'edusphere_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user & send 6-Digit OTP Email via Nodemailer
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userRole = ['student', 'instructor', 'admin'].includes(role) ? role : 'student';

    // Generate 6-Digit Numeric OTP Code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyToken = crypto.randomBytes(24).toString('hex');
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes valid

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      isVerified: false,
      verificationToken: verifyToken,
      otpCode: otp,
      otpExpire
    });

    const verifyUrl = `http://localhost:3000/verify-email?email=${encodeURIComponent(user.email)}`;

    // Dispatch 6-digit OTP email via Nodemailer
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your EduSphere 6-Digit OTP Verification Code',
        message: `Hello ${user.name},\n\nYour 6-Digit Email Verification OTP Code is: ${otp}\n\nThis code expires in 15 minutes. Enter this OTP on the verification page:\n${verifyUrl}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #0d1322; color: #f3f4f6; border-radius: 16px; border: 1px solid rgba(99,102,241,0.3);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #6366f1; margin: 0;">EduSphere Student Verification</h2>
            <p style="color: #9ca3af; font-size: 0.9rem;">Verification OTP Code</p>
          </div>
          
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Please enter the following 6-digit OTP code to verify your student email address and activate your account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2)); border: 2px dashed #6366f1; padding: 16px 36px; border-radius: 12px; font-size: 2.2rem; font-weight: 800; letter-spacing: 0.35em; color: #06b6d4;">
              ${otp}
            </div>
            <p style="font-size: 0.8rem; color: #9ca3af; margin-top: 10px;">Valid for 15 minutes</p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${verifyUrl}" style="background: #6366f1; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Open Verification Screen</a>
          </div>
        </div>`
      });
    } catch (mailErr) {
      console.error('[Nodemailer OTP Warning]:', mailErr.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: false,
      token: generateToken(user._id),
      message: 'Account created! A 6-digit OTP code has been dispatched to your email.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify 6-Digit OTP Code for registration
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit OTP code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (user.isVerified) {
      return res.json({ 
        success: true, 
        message: 'Account is already verified!',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: true,
          token: generateToken(user._id)
        }
      });
    }

    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect 6-digit OTP code. Please try again.' });
    }

    if (user.otpExpire && new Date() > user.otpExpire) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'OTP Verified successfully! Your account is activated.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: true,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request Password Reset 6-Digit OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate 6-Digit Reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = resetOtp;
    user.resetPasswordOTPExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send Reset Email via Nodemailer
    try {
      await sendEmail({
        email: user.email,
        subject: 'EduSphere - Password Reset 6-Digit OTP Code',
        message: `Hello ${user.name},\n\nYour 6-Digit Password Reset OTP Code is: ${resetOtp}\n\nThis code expires in 15 minutes.`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #0d1322; color: #f3f4f6; border-radius: 16px; border: 1px solid rgba(239,68,68,0.3);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ef4444; margin: 0;">EduSphere Password Reset</h2>
            <p style="color: #9ca3af; font-size: 0.9rem;">Reset Verification OTP Code</p>
          </div>
          
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password. Use the 6-digit OTP code below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: rgba(239,68,68,0.15); border: 2px dashed #ef4444; padding: 16px 36px; border-radius: 12px; font-size: 2.2rem; font-weight: 800; letter-spacing: 0.35em; color: #ef4444;">
              ${resetOtp}
            </div>
            <p style="font-size: 0.8rem; color: #9ca3af; margin-top: 10px;">Valid for 15 minutes</p>
          </div>
        </div>`
      });
    } catch (mailErr) {
      console.error('[Nodemailer Reset Warning]:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'Password reset 6-digit OTP code sent to your email address.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password with 6-Digit OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect 6-digit Reset OTP code' });
    }

    if (user.resetPasswordOTPExpire && new Date() > user.resetPasswordOTPExpire) {
      return res.status(400).json({ message: 'Reset OTP code has expired. Please request a new code.' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify student email token link fallback
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email address verified successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: true,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.isVerified === false) {
        return res.status(403).json({
          message: 'Account not verified. Please enter your 6-digit OTP code before signing in.',
          email: user.email,
          isVerified: false
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        isVerified: updatedUser.isVerified,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
