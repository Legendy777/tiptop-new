import { Request, Response } from 'express';
// MONGO BACKUP: import OrderDetails from '../models/OrderDetails';
import { logger } from '../config/logger';
// MONGO BACKUP: import Order, {IOrder} from "../models/Order";
import {clients, io} from "../../index";
// MONGO BACKUP: import Offer from "../models/Offer";
// MONGO BACKUP: import Game from "../models/Game";
// MONGO BACKUP: import {Chat, IMessage} from "../models/Chat";
// MONGO BACKUP: import Payment from "../models/Payment";
import { prisma } from '../db/client';
import { orderRepository, chatRepository } from '../db';

// Create new order details
export const createOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = req.telegramUser?.id;
    logger.info('Creating new order details', { context: { body: req.body } });

    // MONGO BACKUP: const order = await Order.findById(orderId);
    const order = await orderRepository.findById(parseInt(orderId));

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

    // MONGO BACKUP: order.status = 'process';
    // MONGO BACKUP: await order.save();
    await orderRepository.updateStatus(parseInt(orderId), 'process');

    // MONGO BACKUP: const orderDetails = new OrderDetails(req.body);
    // MONGO BACKUP: await orderDetails.save();
    const orderDetails = await prisma.orderDetails.create({
      data: {
        order: { connect: { id: parseInt(orderId) } },
        ...req.body,
        orderId: parseInt(orderId),
      }
    });

    // MONGO BACKUP: const orders: IOrder[] = await Order.find();
    const orders = await orderRepository.findAll();

    io.to('admin').emit('new-order', orders);

    logger.info('Order details created successfully', { context: { orderDetailsId: orderDetails.id } });
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

    // MONGO BACKUP: const orderDetails = await OrderDetails.findOne({ orderId });
    const orderDetails = await prisma.orderDetails.findUnique({
      where: { orderId: parseInt(orderId) }
    });
    
    if (!orderDetails) {
      logger.warn('Order details not found', { context: { orderId } });
      return res.status(404).json({ message: 'Order details not found' });
    }

    logger.info('Order details fetched successfully', { context: { orderId, orderDetailsId: orderDetails.id } });
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

    // MONGO BACKUP: const order = await Order.findById(orderId);
    const order = await orderRepository.findById(parseInt(orderId));
    
    if (!order) {
      logger.warn('Order not found', { context: { orderId } });
      return res.status(404).json({ message: 'Order not found' });
    }

    if (userId !== order.userId) {
      logger.warn('Order does not belong to user', { context: { orderId } });
      return res.status(400).json({ message: 'Order does not belong to user' });
    }

    // MONGO BACKUP: const updatedOrderDetails = await OrderDetails.findOneAndUpdate(
    // MONGO BACKUP:   { orderId },
    // MONGO BACKUP:   req.body,
    // MONGO BACKUP:   { new: true, runValidators: true }
    // MONGO BACKUP: );
    const updatedOrderDetails = await prisma.orderDetails.update({
      where: { orderId: parseInt(orderId) },
      data: req.body
    });

    if (!updatedOrderDetails) {
      logger.warn('Order details not found for update', { context: { orderId } });
      return res.status(404).json({ message: 'Order details not found' });
    }

    // MONGO BACKUP: order.status = "process";
    // MONGO BACKUP: await order.save();
    await orderRepository.updateStatus(parseInt(orderId), 'process');

    // MONGO BACKUP: const payment = await Payment.findOne({ orderId });
    const payment = await prisma.payment.findUnique({
      where: { orderId: parseInt(orderId) }
    });
    
    if (!payment) {
      logger.warn('Payment not found for order', { context: { orderId } });
      return res.status(404).json({ message: 'Payment not found' });
    }

    // MONGO BACKUP: const offer = await Offer.findOne({ _id: order.offerId });
    // MONGO BACKUP: const game = await Game.findOne({ _id: offer?.gameId });
    const offer = await prisma.offer.findUnique({
      where: { id: order.offerId },
      include: { game: true }
    });
    const game = offer?.game;

    // Send notifications
    const orderMsg = `📦 *Order status changed*\n` +
        `🆔 Order ID: ${order.id}\n` +
        `🎮 Game: ${game?.title}\n` +
        `🎮 Offer: ${offer?.title}\n` +
        `💰 Amount: ${payment?.amountToPay} ${order.currency}\n` +
        `📌 Status: ${order.status.toUpperCase()}\n` +
        `🕒 Created: ${new Date(order.createdAt).toLocaleString()}\n` +
        `🕒 Modified: ${new Date(order.updatedAt).toLocaleString()}\n`;

    const message = { sender: -1, content: orderMsg, timestamp: new Date(), isSystemMessage: false };

    // MONGO BACKUP: let chat = await Chat.findOne({ userId: order.userId });
    // MONGO BACKUP: if (!chat) {
    // MONGO BACKUP:   chat = new Chat({
    // MONGO BACKUP:     userId: order.userId,
    // MONGO BACKUP:     messages: [message],
    // MONGO BACKUP:     lastReadByUser: new Date(),
    // MONGO BACKUP:     lastReadByAdmin: new Date(0),
    // MONGO BACKUP:     unreadAdminCount: 0,
    // MONGO BACKUP:   });
    // MONGO BACKUP: } else {
    // MONGO BACKUP:   chat.messages.push(message);
    // MONGO BACKUP: }
    // MONGO BACKUP: await chat.save();
    
    await chatRepository.addMessage(order.userId, message);

    const clientSocketId = clients.get(order.userId);

    if (clientSocketId) {
      io.to(clientSocketId).emit('new_message', { sender: -1, content: orderMsg });
    }

    // MONGO BACKUP: const orders: IOrder[] = await Order.find();
    const orders = await orderRepository.findAll();

    io.to('admin').emit('new-order', orders);

    logger.info('Order details updated successfully', { context: { orderId, orderDetailsId: updatedOrderDetails.id } });
    res.json(updatedOrderDetails);
  } catch (error) {
    logger.error('Error updating order details', { context: { error } });
    res.status(500).json({ message: 'Error updating order details', error });
  }
};
