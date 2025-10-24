import { Request, Response } from 'express';
import { createHash, createHmac } from 'crypto';
import axios from 'axios';
// MONGO BACKUP: import Order, {IOrder} from '../models/Order';
// MONGO BACKUP: import User from '../models/User';
// MONGO BACKUP: import Payment from '../models/Payment';
import { logger } from '../config/logger';
// MONGO BACKUP: import Offer from '../models/Offer';
// MONGO BACKUP: import Game from '../models/Game';
import {clients, io} from '../../index';
// MONGO BACKUP: import {Chat, IMessage} from "../models/Chat";
import console from "node:console";
import {sign} from "@telegram-apps/init-data-node";
import process from "node:process";
import { prisma } from '../db/client';
import { orderRepository, paymentRepository, chatRepository } from '../db';

export const handleCryptoWebhook = async (req: Request, res: Response) => {
  try {
    logger.info('Received crypto webhook request', { context: { headers: req.headers, body: req.body } });

    const { body, headers } = req;
    const token = process.env.CRYPTOPAY_API_KEY;

    if (process.env.NODE_ENV === 'development') {

    } else {
      if (!token) {
        logger.error('CRYPTOPAY_API_KEY is not set');
        return res.status(500).json({ error: 'Configuration error' });
      }

      const secret = createHash('sha256').update(token).digest();
      const checkString = JSON.stringify(body);
      const hmac = createHmac('sha256', secret).update(checkString).digest('hex');

      if (hmac !== headers['crypto-pay-api-signature']) {
        logger.error('Webhook signature does not match', { context: { received: headers['crypto-pay-api-signature'] } });
        return res.status(403).json({ error: 'Invalid signature' });
      }
    }

    const { update_type, payload } = body;

    if (!update_type || !payload) {
      logger.error('Invalid webhook payload', { context: { body } });
      return res.status(400).json({ error: 'Invalid payload' });
    }

    logger.info('Processing webhook update', { context: { update_type, payload } });

    if (update_type === 'invoice_paid') {
      const { invoice_id } = payload;

      logger.info('Processing invoice_paid update', { context: { invoice_id } });

      // MONGO BACKUP: const payment = await Payment.findOne({ externalId: invoice_id });
      const payment = await prisma.payment.findFirst({
        where: { externalId: invoice_id }
      });

      if (!payment) {
        logger.error('Payment not found for invoice_id', { context: { invoice_id } });
        return res.status(404).json({ error: 'Payment not found' });
      }

      // MONGO BACKUP: payment.status = 'completed';
      // MONGO BACKUP: await payment.save();
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' }
      });
      logger.info('Payment status updated to completed', { context: { paymentId: payment.id } });

      // MONGO BACKUP: const order = new Order({
      // MONGO BACKUP:   paymentId: payment._id,
      // MONGO BACKUP:   userId: payment.userId,
      // MONGO BACKUP:   offerId: payment.offerId,
      // MONGO BACKUP:   status: 'pending',
      // MONGO BACKUP:   currency: payment.currency,
      // MONGO BACKUP: });
      // MONGO BACKUP: await order.save();
      
      const order = await orderRepository.create({
        payment: { connect: { id: payment.id } },
        user: { connect: { id: payment.userId } },
        offer: { connect: { id: payment.offerId } },
        status: 'pending',
        currency: payment.currency as 'USDT' | 'RUB',
      });
      
      logger.info('Order created successfully', { context: { orderId: order.id } });

      // MONGO BACKUP: const updatedPayment = await Payment.findByIdAndUpdate(payment._id, { orderId: order._id });
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { orderId: order.id }
      });
      
      if (!updatedPayment) {
        logger.error('Payment not found for orderId', { context: { orderId: order.id } });
        return res.status(404).json({ error: 'Payment not found' });
      }

      // MONGO BACKUP: await User.findByIdAndUpdate(payment.userId, { $inc: { ordersCount: 1 } }, { new: true });
      await prisma.user.update({
        where: { id: payment.userId },
        data: { ordersCount: { increment: 1 } }
      });
      logger.info('User order count updated', { context: { userId: payment.userId } });

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

      logger.info('New order notification sent via WebSocket', { context: { orderId: order.id } });

      const botToken = process.env.BOT_TOKEN;
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      await axios.post(url, {
        chat_id: order.userId,
        text: `Пожалуйста, перейдите в чат для заполнения данных о заказе №${order.id}.`,
        reply_markup: {
          inline_keyboard: [[
            {
              text: "💬 Чат",
              web_app: {
                url: process.env.CLIENT_URL + "/chat"
              }
            }
          ]]
        }
      });
    }

    res.status(200).json({ success: true });
    logger.info('Webhook processed successfully');
  } catch (error) {
    logger.error('Webhook processing error', { context: { error } });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const handleRubWebhook = async (req: Request, res: Response) => {
  try {
    logger.info('Received rub webhook request', { context: { headers: req.headers, body: req.body } });

    const { order_id, stage, signature } = req.body;
    const token = process.env.BLVCKPAY_API_TOKEN;

    if (!token) {
      logger.error('BLVCKPAY_API_TOKEN is not set');
      return res.status(500).json({ error: 'Configuration error' });
    }

    if (!order_id || !stage || !signature) {
      logger.warn('Invalid request body', { context: { body: req.body } });
      return res.status(400).json({ error: 'Invalid request body' });
    }

    if (signature !== token) {
      logger.error('Rub webhook signature does not match', { context: { received: signature } });
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const invoice_id = order_id;


    if (stage === true) {
      logger.info('Processing rub invoice_paid update', { context: { invoice_id } });

      // MONGO BACKUP: const payment = await Payment.findOne({ externalId: invoice_id });
      const payment = await prisma.payment.findFirst({
        where: { externalId: invoice_id }
      });

      if (!payment) {
        logger.error('Payment not found for invoice_id', { context: { invoice_id } });
        return res.status(404).json({ error: 'Payment not found' });
      }

      // MONGO BACKUP: payment.status = 'completed';
      // MONGO BACKUP: await payment.save();
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' }
      });
      logger.info('Payment status updated to completed', { context: { paymentId: payment.id } });

      // MONGO BACKUP: const order = new Order({
      // MONGO BACKUP:   paymentId: payment._id,
      // MONGO BACKUP:   userId: payment.userId,
      // MONGO BACKUP:   offerId: payment.offerId,
      // MONGO BACKUP:   status: 'pending',
      // MONGO BACKUP:   currency: payment.currency,
      // MONGO BACKUP: });
      // MONGO BACKUP: await order.save();
      
      const order = await orderRepository.create({
        payment: { connect: { id: payment.id } },
        user: { connect: { id: payment.userId } },
        offer: { connect: { id: payment.offerId } },
        status: 'pending',
        currency: payment.currency as 'USDT' | 'RUB',
      });
      
      logger.info('Order created successfully', { context: { orderId: order.id } });

      // MONGO BACKUP: const updatedPayment = await Payment.findByIdAndUpdate(payment._id, { orderId: order._id });
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { orderId: order.id }
      });
      
      if (!updatedPayment) {
        logger.error('Payment not found for orderId', { context: { orderId: order.id } });
        return res.status(404).json({ error: 'Payment not found' });
      }

      // MONGO BACKUP: await User.findByIdAndUpdate(payment.userId, { $inc: { ordersCount: 1 } }, { new: true });
      await prisma.user.update({
        where: { id: payment.userId },
        data: { ordersCount: { increment: 1 } }
      });
      logger.info('User order count updated', { context: { userId: payment.userId } });

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

      logger.info('New order notification sent via WebSocket', { context: { orderId: order.id } });

      const botToken = process.env.BOT_TOKEN;
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      await axios.post(url, {
        chat_id: order.userId,
        text: `Пожалуйста, перейдите в чат для заполнения данных о заказе №${order.id}.`,
        reply_markup: {
          inline_keyboard: [[
            {
              text: "💬 Чат",
              web_app: {
                url: process.env.CLIENT_URL + "/chat"
              }
            }
          ]]
        }
      });

      res.status(200).json({
        "order_id": order_id,
        "status": "Paid",
        "amount": payment.amountToPay,
        "description": "Order " + order_id,
      });
    } else {
      // MONGO BACKUP: const payment = await Payment.findOne({ externalId: invoice_id });
      const payment = await prisma.payment.findFirst({
        where: { externalId: invoice_id }
      });
      
      if (!payment) {
        logger.error('Payment not found for invoice_id', { context: { invoice_id } });
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.status(200).json({
        "order_id": order_id,
        "status": "Expired",
        "amount": payment.amountToPay,
        "description": "Order " + order_id,
      });
    }

    logger.info('Webhook processed successfully');
  } catch (error) {
    logger.error('Webhook processing error', { context: { error } });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
