import { Request, Response } from 'express';
// MONGO BACKUP: import Order, {IOrder} from '../models/Order';
import { logger } from '../config/logger';
// MONGO BACKUP: import Game from '../models/Game';
// MONGO BACKUP: import Offer from '../models/Offer';
import {CryptoPay} from "@foile/crypto-pay-api";
import process from "node:process";
// MONGO BACKUP: import Payment from "../models/Payment";
import console from "node:console";
import {cryptoPay} from "./withdrawalController";
// MONGO BACKUP: import Transaction from "../models/Transaction";
import {io} from "../../index";
import { prisma } from '../db/client';
import { orderRepository, paymentRepository, transactionRepository } from '../db';

// -> User

// Get orders by user ID
export const getOrdersByMe = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;
    logger.info('Fetching orders by user ID', { context: { userId } });

    // MONGO BACKUP: const orders = await Order.find({ userId }).sort({ created_at: -1 });
    // MONGO BACKUP: const ordersWithGameTitles = await Promise.all(
    // MONGO BACKUP:   orders.map(async (order) => {
    // MONGO BACKUP:     const offer = await Offer.findById(order.offerId);
    // MONGO BACKUP:     const game = offer ? await Game.findById(offer.gameId) : null;
    // MONGO BACKUP:     return {
    // MONGO BACKUP:       ...order.toObject(),
    // MONGO BACKUP:       gameTitle: game ? game.title : 'Unknown',
    // MONGO BACKUP:     };
    // MONGO BACKUP:   })
    // MONGO BACKUP: );

    const orders = await orderRepository.findByUserId(userId!);
    
    const ordersWithGameTitles = orders.map(order => ({
      ...order,
      gameTitle: order.offer?.game?.title || 'Unknown',
    }));

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

    // MONGO BACKUP: const order = await Order.findById(orderId);
    const order = await orderRepository.findById(parseInt(orderId));
    
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

    // MONGO BACKUP: const count = await Order.countDocuments({ userId, status });
    const count = await prisma.order.count({
      where: { 
        userId: userId!,
        status: status as any
      }
    });

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

    // MONGO BACKUP: const order = await Order.findById(orderId);
    const order = await orderRepository.findById(parseInt(orderId));
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // MONGO BACKUP: const payment = await Payment.findOne({ orderId });
    const payment = await prisma.payment.findUnique({
      where: { orderId: parseInt(orderId) }
    });

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

        // MONGO BACKUP: const transaction = new Transaction({
        // MONGO BACKUP:   userId: payment.userId,
        // MONGO BACKUP:   amount: payment.amountToPay,
        // MONGO BACKUP:   currency: payment.currency,
        // MONGO BACKUP:   type: "refund"
        // MONGO BACKUP: });
        // MONGO BACKUP: await transaction.save();
        
        const transaction = await transactionRepository.createRefundTransaction(
          payment.userId,
          Number(payment.amountToPay),
          payment.currency as 'USDT' | 'RUB'
        );
        
        logger.info('Refund transaction created successfully', { context: { transactionId: transaction.id } });
      } catch (error) {
        logger.error('Error creating refund, transaction', { context: { error } });
        return res.status(500).json({ success: false, error: 'Failed to cancel order' });
      }
    }

    // MONGO BACKUP: order.status = status as Status;
    // MONGO BACKUP: await order.save();
    const updatedOrder = await orderRepository.updateStatus(parseInt(orderId), status as Status);

    // MONGO BACKUP: const orders: IOrder[] = await Order.find();
    const orders = await orderRepository.findAll();

    io.to('admin').emit('new-order', orders);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log(error);
    logger.error('Error updating order status', { context: { error } });
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};
