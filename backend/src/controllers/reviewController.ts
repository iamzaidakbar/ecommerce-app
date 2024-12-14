import { Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { RequestWithUser } from '../middleware/auth';

export const createReview = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, rating, comment } = req.body;
    const images = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400);
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
      images,
    });

    // Update product rating
    const productReviews = await Review.find({ product: productId });
    const averageRating = productReviews.reduce((acc, curr) => acc + curr.rating, 0) / productReviews.length;

    await Product.findByIdAndUpdate(productId, { rating: averageRating });

    res.status(201).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}; 