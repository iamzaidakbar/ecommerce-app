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

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
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
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Our E-commerce Platform',
      html: `
        <h1>Welcome ${user.firstName}!</h1>
        <p>Thank you for registering with us.</p>
        <p>You can now start shopping on our platform.</p>
      `,
    });

    res.status(201).json({
      status: 'success',
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

    const resetToken = createPasswordResetToken(user);
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token (valid for 10 minutes)',
      html: `
        <p>Forgot your password? Submit a PATCH request with your new password to: ${resetURL}</p>
        <p>If you didn't forget your password, please ignore this email!</p>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
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

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    next(error);
  }
};
