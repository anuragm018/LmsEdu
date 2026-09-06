import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "edusphere_jwt_secret_key_2026",
    {
      expiresIn: "30d",
    },
  );
};
// Generate 6-Digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// REGISTER USER
// POST /api/auth/register
// Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Validate role
    const userRole = ["student", "instructor", "admin"].includes(role)
      ? role
      : "student";

    // Generate OTP
    const otp = generateOTP();

    // OTP expires in 15 minutes
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000);

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Create user
    // Password will automatically be hashed by User model
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      isVerified: false,
      otpCode: hashedOtp,
      otpExpire,
    });

    console.log(`[AUTH] Email Verification OTP for ${user.email}: ${otp}`);

    let emailSent = true;
    try {
      await sendEmail({
        email: user.email,
        subject: "EduSphere - Email Verification OTP",
        message: `Hello ${user.name},

Your EduSphere email verification OTP is:

${otp}

This OTP is valid for 15 minutes.

Please enter this OTP in the EduSphere verification page.

If you did not create this account, please ignore this email.`,
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 550px;
            margin: 0 auto;
            padding: 24px;
            background: #0d1322;
            color: #f3f4f6;
            border-radius: 16px;
            border: 1px solid rgba(99,102,241,0.3);
          ">
            <div style="
              text-align: center;
              margin-bottom: 20px;
            ">
              <h2 style="
                color: #6366f1;
                margin: 0;
              ">
                EduSphere
              </h2>
              <p style="
                color: #9ca3af;
                font-size: 14px;
              ">
                Email Verification
              </p>
            </div>
            <p>
              Hello <strong>${user.name}</strong>,
            </p>
            <p>
              Thank you for registering with EduSphere.
              Please use the OTP below to verify your email address.
            </p>
            <div style="
              text-align: center;
              margin: 30px 0;
            ">
              <div style="
                display: inline-block;
                background: rgba(99,102,241,0.15);
                border: 2px dashed #6366f1;
                padding: 16px 36px;
                border-radius: 12px;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #06b6d4;
              ">
                ${otp}
              </div>
              <p style="
                font-size: 13px;
                color: #9ca3af;
                margin-top: 10px;
              ">
                This OTP is valid for 15 minutes.
              </p>
            </div>
            <p style="
              font-size: 13px;
              color: #9ca3af;
            ">
              If you did not create this account, you can safely ignore
              this email.
            </p>
          </div>
        `,
      });
    } catch (mailError) {
      emailSent = false;
      console.error("[Nodemailer Registration OTP Error]:", mailError.message);
    }
    // Response
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      emailSent,
      message: emailSent
        ? "Account created successfully. A 6-digit OTP has been sent to your email."
        : "Account created, but email delivery encountered an issue. You can click Resend OTP or check your terminal logs.",
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// VERIFY OTP
// POST /api/auth/verify-otp
// Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and 6-digit OTP are required",
      });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({
        message: "OTP must be exactly 6 digits",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.json({
        success: true,
        message: "Account is already verified",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: true,
          token: generateToken(user._id),
        },
      });
    }

    // Check OTP exists
    if (!user.otpCode) {
      return res.status(400).json({
        message: "No active OTP found. Please request a new OTP.",
      });
    }

    // Check OTP expiry BEFORE comparison
    if (user.otpExpire && new Date() > user.otpExpire) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Compare entered OTP with hashed OTP
    const isMatch = await bcrypt.compare(otp.trim(), user.otpCode);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect OTP. Please try again.",
      });
    }

    // Verify account
    user.isVerified = true;

    // Remove OTP after successful verification
    user.otpCode = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully. Your account is now active.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: true,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// RESEND OTP
// POST /api/auth/resend-otp
// Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email address" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This account is already verified. Please sign in." });
    }

    // Generate fresh 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 15 * 60 * 1000;

    user.otpCode = await bcrypt.hash(otp, 10);
    user.otpExpire = otpExpire;
    await user.save();

    console.log(`[AUTH] Resent Email Verification OTP for ${user.email}: ${otp}`);

    // Send OTP Email
    try {
      await sendEmail({
        email: user.email,
        subject: "EduSphere - Email Verification OTP (Resend)",
        message: `Hello ${user.name},\n\nYour new EduSphere email verification OTP is:\n\n${otp}\n\nThis OTP is valid for 15 minutes.\n\nIf you did not request this, please ignore this email.`,
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 550px;
            margin: 0 auto;
            padding: 24px;
            background: #0d1322;
            color: #f3f4f6;
            border-radius: 16px;
            border: 1px solid rgba(99,102,241,0.3);
          ">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #6366f1; margin: 0;">EduSphere</h2>
              <p style="color: #9ca3af; font-size: 14px;">Email Verification</p>
            </div>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Here is your new OTP to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="
                display: inline-block;
                background: rgba(99,102,241,0.15);
                border: 2px dashed #6366f1;
                padding: 16px 36px;
                border-radius: 12px;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #06b6d4;
              ">
                ${otp}
              </div>
              <p style="font-size: 13px; color: #9ca3af; margin-top: 10px;">
                This OTP is valid for 15 minutes.
              </p>
            </div>
            <p style="font-size: 13px; color: #9ca3af;">
              If you did not request this OTP, please ignore this email.
            </p>
          </div>
        `
      });
    } catch (mailError) {
      console.error("[Nodemailer Resend OTP Error]:", mailError.message);
      return res.status(500).json({
        message: "Failed to send verification email. Please check server logs or try again.",
        error: mailError.message
      });
    }

    res.json({
      success: true,
      message: "A new 6-digit OTP has been sent to your email."
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD
// POST /api/auth/forgot-password
// Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email address is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
      });
    }

    // Generate reset OTP
    const resetOtp = generateOTP();

    // Reset OTP expires in 15 minutes
    const resetOtpExpire = new Date(Date.now() + 15 * 60 * 1000);

    // Hash reset OTP
    const hashedResetOtp = await bcrypt.hash(resetOtp, 10);

    user.resetPasswordOTP = hashedResetOtp;
    user.resetPasswordOTPExpire = resetOtpExpire;

    await user.save();

    console.log(`[AUTH] Password Reset OTP for ${user.email}: ${resetOtp}`);

    // Send Reset OTP Email
    try {
      await sendEmail({
        email: user.email,

        subject: "EduSphere - Password Reset OTP",

        message: `Hello ${user.name},

Your EduSphere password reset OTP is:

${resetOtp}

This OTP is valid for 15 minutes.

If you did not request a password reset, please ignore this email.`,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 550px;
            margin: 0 auto;
            padding: 24px;
            background: #0d1322;
            color: #f3f4f6;
            border-radius: 16px;
            border: 1px solid rgba(239,68,68,0.3);
          ">

            <div style="
              text-align: center;
              margin-bottom: 20px;
            ">
              <h2 style="
                color: #ef4444;
                margin: 0;
              ">
                EduSphere
              </h2>

              <p style="
                color: #9ca3af;
                font-size: 14px;
              ">
                Password Reset
              </p>
            </div>

            <p>
              Hello <strong>${user.name}</strong>,
            </p>

            <p>
              We received a request to reset your password.
              Use the OTP below to continue.
            </p>

            <div style="
              text-align: center;
              margin: 30px 0;
            ">

              <div style="
                display: inline-block;
                background: rgba(239,68,68,0.15);
                border: 2px dashed #ef4444;
                padding: 16px 36px;
                border-radius: 12px;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #ef4444;
              ">
                ${resetOtp}
              </div>

              <p style="
                font-size: 13px;
                color: #9ca3af;
                margin-top: 10px;
              ">
                This OTP is valid for 15 minutes.
              </p>

            </div>

            <p style="
              font-size: 13px;
              color: #9ca3af;
            ">
              If you did not request this password reset,
              please ignore this email.
            </p>

          </div>
        `,
      });
    } catch (mailError) {
      console.error("[Nodemailer Reset OTP Error]:", mailError.message);
    }

    res.json({
      success: true,
      message: "Password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// RESET PASSWORD
// POST /api/auth/reset-password
// Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({
        message: "OTP must be exactly 6 digits",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    // Check reset OTP exists
    if (!user.resetPasswordOTP) {
      return res.status(400).json({
        message:
          "No active password reset OTP found. Please request a new OTP.",
      });
    }

    // Check reset OTP expiry
    if (
      user.resetPasswordOTPExpire &&
      new Date() > user.resetPasswordOTPExpire
    ) {
      return res.status(400).json({
        message: "Password reset OTP has expired. Please request a new OTP.",
      });
    }

    // Compare OTP
    const isResetMatch = await bcrypt.compare(
      otp.trim(),
      user.resetPasswordOTP,
    );

    if (!isResetMatch) {
      return res.status(400).json({
        message: "Incorrect password reset OTP",
      });
    }

    // Set new password
    // User model pre-save hook will hash it automatically
    user.password = newPassword;

    // Remove reset OTP
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN USER
// POST /api/auth/login
// Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Password is select:false in User model
    // Therefore explicitly include it
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if account is suspended by administrator
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been suspended by the administrator. Please contact support.",
        isBlocked: true,
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Account not verified. Please verify your email using the 6-digit OTP.",
        email: user.email,
        isVerified: false,
      });
    }
    // Login Security Email
    try {
      await sendEmail({
        email: user.email,

        subject: "EduSphere Security Alert - Successful Login",

        message: `Hello ${user.name},

A successful login to your EduSphere LMS account was detected.

Role: ${user.role}
Time: ${new Date().toLocaleString()}

If this was you, no action is needed.

If you did not authorize this login, please reset your password immediately.`,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 550px;
            margin: 0 auto;
            padding: 24px;
            background: #0d1322;
            color: #f3f4f6;
            border-radius: 16px;
            border: 1px solid rgba(99,102,241,0.3);
          ">

            <h2 style="
              color: #6366f1;
            ">
              EduSphere Security Alert
            </h2>

            <p>
              Hello <strong>${user.name}</strong>,
            </p>

            <p>
              A successful login to your EduSphere LMS account
              was detected.
            </p>

            <p>
              <strong>Role:</strong> ${user.role}
            </p>

            <p>
              <strong>Time:</strong>
              ${new Date().toLocaleString()}
            </p>

            <p style="
              color: #9ca3af;
              font-size: 13px;
            ">
              If this was you, no action is needed.
              If you did not authorize this login,
              please reset your password immediately.
            </p>

          </div>
        `,
      });
    } catch (mailError) {
      // Don't fail login if security email fails
      console.error("[Nodemailer Login Alert Error]:", mailError.message);
    }
    // Login Respons
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// GET USER PROFILE
// GET /api/auth/profile
// Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone_no: user.phone_no,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// UPDATE USER PROFILE
// PUT /api/auth/profile
// Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update name
    if (req.body.name) {
      user.name = req.body.name.trim();
    }

    // Update bio
    if (req.body.bio !== undefined) {
      user.bio = req.body.bio.trim();
    }

    // Update avatar
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    // Update phone number
    if (req.body.phone_no !== undefined) {
      user.phone_no = req.body.phone_no.trim();
    }

    // Update password
    // User model pre-save hook will hash it
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long",
        });
      }

      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone_no: updatedUser.phone_no,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      isVerified: updatedUser.isVerified,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
