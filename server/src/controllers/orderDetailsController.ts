import { Request, Response } from 'express';
import OrderDetails from '../models/OrderDetails';
import { logger } from '../config/logger';
import Order, {IOrder} from "../models/Order";
import {clients, io} from "../../index";
import Offer from "../models/Offer";
import Game from "../models/Game";
import {Chat, IMessage} from "../models/Chat";
import Payment from "../models/Payment";

// Create new order details
export const createOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = req.telegramUser?.id;
    logger.info('Creating new order details', { context: { body: req.body } });

    const order = await Order.findById(orderId);

    if (!order) {
      logger.warn('Order not found', { context: { orderId } });
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== userId) {
      logger.warn('Order does not belong to user', { context: { orderId } });
      return res.status(400).json({ message: 'Order does not belong to user' });
    }

    if (order.status !== 'pending') {
      logger.warn('Order status is not pending', { context: { orderId } });
      return res.status(400).json({ message: 'Order status is not pending' });
    }

    order.status = 'process';
    await order.save();

    const orderDetails = new OrderDetails(req.body);
    await orderDetails.save();

    const orders: IOrder[] = await Order.find();

    io.to('admin').emit('new-order', orders);

    logger.info('Order details created successfully', { context: { orderDetailsId: orderDetails._id } });
    res.status(201).json(orderDetails);
  } catch (error) {
    logger.error('Error creating order details', { context: { error } });
    res.status(500).json({ message: 'Error creating order details', error });
  }
};

// Get order details by order ID
export const getOrderDetailsByOrderId = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    logger.info('Fetching order details by order ID', { context: { orderId } });

    const orderDetails = await OrderDetails.findOne({ orderId });
    if (!orderDetails) {
      logger.warn('Order details not found', { context: { orderId } });
      return res.status(404).json({ message: 'Order details not found' });
    }

    logger.info('Order details fetched successfully', { context: { orderId, orderDetailsId: orderDetails._id } });
    res.json(orderDetails);
  } catch (error) {
    logger.error('Error fetching order details', { context: { error } });
    res.status(500).json({ message: 'Error fetching order details', error });
  }
};

// Update order details by order ID
export const updateOrderDetailsByOrderId = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.telegramUser?.id;
    logger.info('Updating order details by order ID', { context: { orderId, body: req.body } });

    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn('Order not found', { context: { orderId } });
      return res.status(404).json({ message: 'Order not found' });
    }

    if (userId !== order.userId) {
      logger.warn('Order does not belong to user', { context: { orderId } });
      return res.status(400).json({ message: 'Order does not belong to user' });
    }

    const updatedOrderDetails = await OrderDetails.findOneAndUpdate(
      { orderId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOrderDetails) {
      logger.warn('Order details not found for update', { context: { orderId } });
      return res.status(404).json({ message: 'Order details not found' });
    }

    order.status = "process";
    await order.save();

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      logger.warn('Payment not found for order', { context: { orderId } });
      return res.status(404).json({ message: 'Payment not found' });
    }

    const offer = await Offer.findOne({ _id: order.offerId });
    const game = await Game.findOne({ _id: offer?.gameId });

    // Send notifications
    const orderMsg = `📦 *Order status changed*\n` +
        `🆔 Order ID: ${order._id}\n` +
        `🎮 Game: ${game?.title}\n` +
        `🎮 Offer: ${offer?.title}\n` +
        `💰 Amount: ${payment?.amountToPay} ${order.currency}\n` +
        `📌 Status: ${order.status.toUpperCase()}\n` +
        `🕒 Created: ${new Date(order.createdAt).toLocaleString()}\n` +
        `🕒 Modified: ${new Date(order.updatedAt).toLocaleString()}\n`;

    const message: IMessage = { sender: -1, content: orderMsg, timestamp: new Date(), isSystemMessage: false };

    let chat = await Chat.findOne({ userId: order.userId });
    if (!chat) {
      chat = new Chat({
        userId: order.userId,
        messages: [message],
        lastReadByUser: new Date(),
        lastReadByAdmin: new Date(0),
        unreadAdminCount: 0,
      });
    } else {
      chat.messages.push(message);
    }
    await chat.save();

    const clientSocketId = clients.get(order.userId);

    if (clientSocketId) {
      io.to(clientSocketId).emit('new_message', { sender: -1, content: orderMsg });
    }

    const orders: IOrder[] = await Order.find();

    io.to('admin').emit('new-order', orders);

    logger.info('Order details updated successfully', { context: { orderId, orderDetailsId: updatedOrderDetails._id } });
    res.json(updatedOrderDetails);
  } catch (error) {
    logger.error('Error updating order details', { context: { error } });
    res.status(500).json({ message: 'Error updating order details', error });
  }
};