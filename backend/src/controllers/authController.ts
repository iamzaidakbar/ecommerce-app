import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IUser, User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import env from '../config/env';
import sendEmail from '../config/email';
import crypto from 'crypto';

const generateToken = (id: mongoose.Types.ObjectId): string => {
  return jwt.sign({ id: id.toString() }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

// Generate reset token
const createPasswordResetToken = (user: IUser): string => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createEmailVerificationOTP = (user: IUser): string => {
  const otp = generateOTP();
  user.emailVerificationOTP = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false
    });

    // Generate OTP
    const otp = createEmailVerificationOTP(user);
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP',
      html: `
        <h1>Welcome to Our E-commerce Platform!</h1>
        <p>Your verification code is:</p>
        <h2 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px;">${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'OTP sent to email',
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  console.log(req.body);
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('No user found with that email address', 404);
    }

    // Generate reset token
    const resetToken = createPasswordResetToken(user);
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        html: `
          <h1>Password Reset Request</h1>
          <p>Forgot your password? Submit a PATCH request with your new password to: ${resetURL}</p>
          <p>If you didn't forget your password, please ignore this email!</p>
        `,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('Error sending email. Try again later.', 500);
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({
      emailVerificationOTP: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email after verification
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Our E-commerce Platform',
      html: `
        <h1>Welcome ${user.firstName}! 🎉</h1>
        <p>Thank you for verifying your email address.</p>
        <p>Your account is now fully activated and you can start shopping on our platform.</p>
        <div style="margin: 20px 0;">
          <p>Here's what you can do next:</p>
          <ul>
            <li>Browse our product catalog</li>
            <li>Add items to your wishlist</li>
            <li>Make your first purchase</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy Shopping! 🛍️</p>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. Welcome email sent!'
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new OTP
    const otp = createEmailVerificationOTP(user);
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP (resent)',
      html: `
        <h1>Email Verification</h1>
        <p>Your new verification code is:</p>
        <h2 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px;">${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'New OTP sent to email'
    });
  } catch (error) {
    next(error);
  }
};
