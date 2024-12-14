import { Router } from 'express';
import { body } from 'express-validator';
import { createReview } from '../controllers/reviewController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/auth';
import { upload } from '../services/uploadService';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  upload.array('images', 5),
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required'),
  ],
  validateRequest,
  createReview as any
);

export default router; 