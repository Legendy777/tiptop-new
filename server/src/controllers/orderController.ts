import { Request, Response } from 'express';
import Order, {IOrder} from '../models/Order';
import { logger } from '../config/logger';
import Game from '../models/Game';
import Offer from '../models/Offer';
import {CryptoPay} from "@foile/crypto-pay-api";
import process from "node:process";
import Payment from "../models/Payment";
import console from "node:console";
import {cryptoPay} from "./withdrawalController";
import Transaction from "../models/Transaction";
import {io} from "../../index";

// -> User

// Get orders by user ID
export const getOrdersByMe = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;
    logger.info('Fetching orders by user ID', { context: { userId } });

    const orders = await Order.find({ userId }).sort({ created_at: -1 });

    // Fetch game titles for each order
    const ordersWithGameTitles = await Promise.all(
      orders.map(async (order) => {
        const offer = await Offer.findById(order.offerId);
        const game = offer ? await Game.findById(offer.gameId) : null;
        return {
          ...order.toObject(),
          gameTitle: game ? game.title : 'Unknown',
        };
      })
    );

    logger.info('Orders fetched successfully', { context: { userId, orderCount: orders.length } });
    res.json({ success: true, orders: ordersWithGameTitles });
  } catch (error) {
    logger.error('Error fetching user orders', { context: { error } });
    res.status(500).json({ success: false, error: 'Failed to fetch user orders' });
  }
};

// Get order by id
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    logger.info('Fetching order by ID', { context: { orderId } });

    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn('Order not found', { context: { orderId } });
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    logger.info('Order fetched successfully', { context: { orderId } });
    res.json(order);
  } catch (error) {
    logger.error('Error fetching order', { context: { error } });
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
}

// Get count of orders by status
export const getOrdersCountByStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;
    const { status } = req.params;
    logger.info('Fetching order count by status', { context: { userId, status } });

    const count = await Order.countDocuments({ userId, status });

    logger.info('Order count fetched successfully', { context: { userId, status, count } });
    res.json({ success: true, count });
  } catch (error) {
    logger.error('Error getting order count', { context: { error } });
    res.status(500).json({ success: false, error: 'Failed to get order count' });
  }
};

// -> Admin

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.params;

    const allowedStatuses = ['pending', 'process', 'completed', 'canceled', 'invalid'] as const;
    type Status = typeof allowedStatuses[number];

    if (!allowedStatuses.includes(status as Status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      logger.warn('Payment not found', { context: { orderId } });
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (status === "invalid" && order.status === "invalid") {
      logger.log('Order is already invalid', { context: { orderId } });
      return res.json({ success: true, order });
    }

    if (status === order.status) {
      logger.warn('Order status is already the same', { context: { orderId, status } });
      return res.status(400).json({ success: false, error: 'Order status is already the same' });
    }

    if (status === "canceled" && payment) {
      try {
        const spend_id = `refund_${Date.now()}`;
        await cryptoPay.transfer(payment.userId, payment.currency, payment.amountToPay.toString(), spend_id);
        logger.info('Refund transaction created successfully', { context: { spend_id } });

        const transaction = new Transaction({
          userId: payment.userId,
          amount: payment.amountToPay,
          currency: payment.currency,
          type: "refund"
        });

        await transaction.save();
        logger.info('Refund transaction created successfully', { context: { transactionId: transaction._id } });
      } catch (error) {
        logger.error('Error creating refund, transaction', { context: { error } });
        return res.status(500).json({ success: false, error: 'Failed to cancel order' });
      }
    }

    order.status = status as Status;
    await order.save();

    const orders: IOrder[] = await Order.find();

    io.to('admin').emit('new-order', orders);

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    logger.error('Error updating order status', { context: { error } });
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};
