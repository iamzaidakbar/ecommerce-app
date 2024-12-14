import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import sendEmail from '../config/email';
import { RequestWithUser } from '../middleware/auth';
import mongoose, { Document } from 'mongoose';

interface PopulatedOrder extends Document {
  user: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };
  status: string;
  _id: mongoose.Types.ObjectId;
}

export const createOrder = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Calculate total amount and verify product availability
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new AppError(`Product ${item.product} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for product ${product.name}`, 400);
      }
      totalAmount += product.price * item.quantity;

      // Update product stock
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: items.map((item: any) => ({
        ...item,
        price: item.price,
      })),
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    await sendEmail({
      email: req.user.email,
      subject: 'Order Confirmation',
      html: `
        <h1>Order Confirmed!</h1>
        <p>Your order #${order._id} has been received.</p>
        <p>Total Amount: $${order.totalAmount}</p>
        <p>We'll notify you when your order ships.</p>
      `,
    });

    res.status(201).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('items.product');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findByIdAndUpdate<PopulatedOrder>(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate('user', 'email');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === 'shipped') {
      await sendEmail({
        email: order.user.email,
        subject: 'Your Order Has Shipped',
        html: `
          <h1>Order Shipped!</h1>
          <p>Your order #${order._id} is on its way.</p>
          <p>Expected delivery: 3-5 business days</p>
        `,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending',
    });

    if (!order) {
      throw new AppError('Order not found or cannot be cancelled', 404);
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
