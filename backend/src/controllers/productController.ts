import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { PipelineStage } from 'mongoose';

interface FilterQuery {
  isActive: boolean;
  name?: { $regex: string; $options: string };
  category?: string;
  price?: { $gte?: number; $lte?: number };
  stock?: { $gte?: number };
}

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minStock,
      sortBy = 'createdAt',
      order = 'desc',
      limit = 10,
      page = 1,
    } = req.query;

    // Base query
    const query: FilterQuery = { isActive: true };

    // Search by name or description (full text search)
    if (search) {
      query.name = { $regex: String(search), $options: 'i' };
    }

    // Filter by category
    if (category) {
      query.category = String(category);
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by stock
    if (minStock) {
      query.stock = { $gte: Number(minStock) };
    }

    // Build query
    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with aggregation pipeline
    const aggregation = [
      { $match: query },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { [String(sortBy)]: sortOrder } },
            { $skip: skip },
            { $limit: Number(limit) },
          ],
        },
      },
    ];

    const [result] = await Product.aggregate(aggregation as PipelineStage[]);
    const total = result.metadata[0]?.total || 0;
    const products = result.data;

    // Get unique categories for filters
    const categories = await Product.distinct('category', { isActive: true });

    // Get price range
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
      filters: {
        categories,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
      },
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const products = await Product.find(
      {
        $text: { $search: String(q) },
        isActive: true,
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};
