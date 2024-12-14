import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { Order, IOrder } from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import env from '../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId) as IOrder;
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus === 'paid') {
      throw new AppError('Order is already paid', 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        customerEmail: req.user.email,
      },
    });

    // Update order with payment intent
    order.paymentDetails = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
    await order.save();

    res.status(200).json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId) as IOrder;

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus !== 'paid') {
      throw new AppError('Order is not paid', 400);
    }

    const paymentIntentId = order.paymentDetails?.paymentIntentId;
    if (!paymentIntentId) {
      throw new AppError('Payment details not found', 400);
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    if (!order.paymentDetails) {
      order.paymentDetails = {};
    }
    order.paymentDetails.refundId = refund.id;
    await order.save();

    res.status(200).json({
      status: 'success',
      data: { refund },
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new AppError(`Webhook Error: ${err.message}`, 400);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        status: 'processing',
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}; 