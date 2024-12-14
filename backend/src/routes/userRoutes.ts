import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
} from '../controllers/userController';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { upload } from '../services/uploadService';

const router = express.Router();

// Protected routes (authenticated users)
router.use(requireAuth);

// User profile routes
router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('firstName')
      .optional()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('lastName')
      .optional()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
  ],
  validateRequest,
  updateProfile
);

// Add this route after other profile routes
router.post(
  '/profile/image',
  requireAuth,
  upload.single('image'),
  uploadProfileImage as any
);

// Admin routes
router.use(requireAdmin);

router.get('/', getUsers);
router.get('/:id', getUser);
router.put(
  '/:id',
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Invalid role'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  validateRequest,
  updateUser
);
router.delete('/:id', deleteUser);

export default router;
