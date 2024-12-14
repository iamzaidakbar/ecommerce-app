import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
} from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName')
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validateRequest,
  login
);

router.post('/logout', logout);

router.post('/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email'),
  ],
  validateRequest,
  forgotPassword
);

router.patch('/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  resetPassword
);

router.post('/verify-email',
  [
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('Invalid OTP format'),
  ],
  validateRequest,
  verifyEmail
);

router.post('/resend-verification', 
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  validateRequest, 
  resendVerificationEmail
);

export default router;
