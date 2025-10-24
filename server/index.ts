import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import http from 'http'; // CHANGED: Was https, now http
import { Server } from 'socket.io';

// --- fs is no longer needed, can be removed or kept, it's unused ---
// import fs from 'fs';

// MONGO BACKUP: import { connectDB } from './src/config/database';
import { connectDatabase, chatRepository, orderRepository, gameRepository, offerRepository, paymentRepository, referralRepository, userRepository } from './src/db';
import { logger, stream } from './src/config/logger';

import gameRoutes from './src/routes/gameRoutes';
import offerRoutes from './src/routes/offerRoutes';
import userRoutes from './src/routes/userRoutes';
import orderRoutes from './src/routes/orderRoutes';
import orderDetailsRoutes from './src/routes/orderDetailsRoutes';
import paymentRoutes from './src/routes/paymentRoutes';
import reviewRoutes from './src/routes/reviewRoutes';
import withdrawalRoutes from './src/routes/withdrawalRoutes';
import webhookRoutes from './src/routes/webhookRoutes';
import chatRoutes from './src/routes/chatRoutes';
import referralRoutes from './src/routes/referralRoutes';
import transactionRoutes from './src/routes/transactionRoutes';
import adminRoutes from './src/routes/adminRoutes';

// MONGO BACKUP: import { Chat, IMessage } from "./src/models/Chat";
// MONGO BACKUP: import Order, { IOrder } from "./src/models/Order";
// MONGO BACKUP: import Offer from "./src/models/Offer";
// MONGO BACKUP: import Game from "./src/models/Game";
// MONGO BACKUP: import Payment from "./src/models/Payment";
import process from "node:process";
// MONGO BACKUP: import Referral from "./src/models/Referral";
// MONGO BACKUP: import User from "./src/models/User";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // CHANGED: Port for internal use

// --- ENTIRE BLOCK WITH SSL CERTIFICATES REMOVED ---

const httpServer = http.createServer(app);

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174'
];

export const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream }));

const secretKey = randomBytes(16).toString('hex');

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

export const clients = new Map<number, string>();

io.on('connection', socket => {
    socket.on('register_client', async (userId: number) => {
        clients.set(userId, socket.id);
        socket.join(`userId-${userId}`);

        // MONGO BACKUP: let chat = await Chat.findOne({ userId });
        // MONGO BACKUP: if (chat) {
        // MONGO BACKUP:     chat.lastReadByUser = new Date();
        // MONGO BACKUP:     chat.unreadAdminCount = 0;
        // MONGO BACKUP:     await chat.save();
        // MONGO BACKUP: 
        // MONGO BACKUP:     socket.emit('chat_history', chat.messages);
        // MONGO BACKUP: 
        // MONGO BACKUP:     const unreadCount = chat.messages.filter(
        // MONGO BACKUP:         m => m.timestamp > (chat.lastReadByUser || new Date(0)) && m.sender === 0
        // MONGO BACKUP:     ).length;
        // MONGO BACKUP:     socket.emit('unread_count', unreadCount);
        // MONGO BACKUP: } else {
        // MONGO BACKUP:     socket.emit('chat_history', []);
        // MONGO BACKUP:     socket.emit('unread_count', 0);
        // MONGO BACKUP: }

        let chat = await chatRepository.findByUserId(userId);
        if (chat) {
            await chatRepository.markAsReadByUser(chat.id);
            
            socket.emit('chat_history', chat.messages);
            
            const unreadCount = chat.messages.filter(
                m => m.timestamp > (chat.lastReadByUser || new Date(0)) && m.sender === 0
            ).length;
            socket.emit('unread_count', unreadCount);
        } else {
            socket.emit('chat_history', []);
            socket.emit('unread_count', 0);
        }
    });

    socket.on('register_admin', async () => {
        socket.join('admin');
        // MONGO BACKUP: const allChats = await Chat.find({});
        // MONGO BACKUP: const chatMap: Record<number, IMessage[]> = {};
        // MONGO BACKUP: const unreadCounts: Record<number, number> = {};
        // MONGO BACKUP: 
        // MONGO BACKUP: allChats.forEach(chat => {
        // MONGO BACKUP:     chatMap[chat.userId] = chat.messages;
        // MONGO BACKUP:     unreadCounts[chat.userId] = chat.unreadAdminCount;
        // MONGO BACKUP: });
        // MONGO BACKUP: 
        // MONGO BACKUP: const orders: IOrder[] = await Order.find();
        // MONGO BACKUP: 
        // MONGO BACKUP: socket.emit('chat_history', chatMap);
        // MONGO BACKUP: socket.emit('orders_history', orders);
        // MONGO BACKUP: socket.emit('unread_counts', unreadCounts);

        const allChats = await chatRepository.findAll();
        const chatMap: Record<number, any[]> = {};
        const unreadCounts: Record<number, number> = {};
        
        allChats.forEach(chat => {
            chatMap[chat.userId] = chat.messages;
            unreadCounts[chat.userId] = chat.unreadAdminCount;
        });
        
        const orders = await orderRepository.findAll();
        
        socket.emit('chat_history', chatMap);
        socket.emit('orders_history', orders);
        socket.emit('unread_counts', unreadCounts);
    });

    socket.on('admin_select_chat', async (userId: number) => {
        // MONGO BACKUP: const chat = await Chat.findOne({ userId });
        // MONGO BACKUP: if (chat) {
        // MONGO BACKUP:     chat.lastReadByAdmin = new Date();
        // MONGO BACKUP:     chat.unreadAdminCount = 0;
        // MONGO BACKUP:     await chat.save();
        // MONGO BACKUP: 
        // MONGO BACKUP:     socket.emit('chat_history', chat.messages);
        // MONGO BACKUP:     socket.emit('unread_count', 0);
        // MONGO BACKUP: 
        // MONGO BACKUP:     io.to('admin').emit('update_unread_count', { userId, unreadAdmin: 0 });
        // MONGO BACKUP: }

        const chat = await chatRepository.findByUserId(userId);
        if (chat) {
            await chatRepository.markAsReadByAdmin(chat.id);
            
            socket.emit('chat_history', chat.messages);
            socket.emit('unread_count', 0);
            
            io.to('admin').emit('update_unread_count', { userId, unreadAdmin: 0 });
        }
    });

    socket.on('send_message', async ({ sender, userId, content }) => {
        // MONGO BACKUP: const message: IMessage = { sender, content, timestamp: new Date(), isSystemMessage: false };
        // MONGO BACKUP: 
        // MONGO BACKUP: let chat = await Chat.findOne({ userId });
        // MONGO BACKUP: if (!chat) {
        // MONGO BACKUP:     chat = new Chat({
        // MONGO BACKUP:         userId,
        // MONGO BACKUP:         messages: [message],
        // MONGO BACKUP:         lastReadByUser: new Date(),
        // MONGO BACKUP:         lastReadByAdmin: new Date(0),
        // MONGO BACKUP:         unreadAdminCount: sender !== 0 ? 1 : 0,
        // MONGO BACKUP:     });
        // MONGO BACKUP: } else {
        // MONGO BACKUP:     chat.messages.push(message);
        // MONGO BACKUP:     if (sender !== 0) chat.unreadAdminCount = (chat.unreadAdminCount || 0) + 1;
        // MONGO BACKUP: }
        // MONGO BACKUP: await chat.save();
        // MONGO BACKUP: 
        // MONGO BACKUP: io.to('admin').emit('new_message', { ...message, userId, unreadAdmin: chat.unreadAdminCount });

        let chat = await chatRepository.findOrCreate(userId);
        
        const message = await chatRepository.addMessage(chat.id, {
            sender,
            content,
            timestamp: new Date(),
            isSystemMessage: false,
        });
        
        if (sender !== 0) {
            await chatRepository.incrementUnreadAdminCount(chat.id);
            chat = await chatRepository.findById(chat.id);
        }
        
        io.to('admin').emit('new_message', { ...message, userId, unreadAdmin: chat.unreadAdminCount });
    });

    socket.on('admin_reply', async ({ userId, content }) => {
        // MONGO BACKUP: const message: IMessage = { sender: 0, content, timestamp: new Date(), isSystemMessage: false };
        // MONGO BACKUP: const chat = await Chat.findOne({ userId });
        // MONGO BACKUP: if (chat) {
        // MONGO BACKUP:     chat.messages.push(message);
        // MONGO BACKUP:     await chat.save();
        // MONGO BACKUP: 
        // MONGO BACKUP:     const clientSocketId = clients.get(userId);
        // MONGO BACKUP:     if (clientSocketId) io.to(clientSocketId).emit('new_message', { ...message });
        // MONGO BACKUP: 
        // MONGO BACKUP:     const botToken = process.env.BOT_TOKEN;
        // MONGO BACKUP:     const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        // MONGO BACKUP: 
        // MONGO BACKUP:     await axios.post(url, {
        // MONGO BACKUP:         chat_id: userId,
        // MONGO BACKUP:         text: `В чате появилось новое сообщение.`,
        // MONGO BACKUP:         reply_markup: {
        // MONGO BACKUP:             inline_keyboard: [[
        // MONGO BACKUP:                 {
        // MONGO BACKUP:                     text: "💬 Чат",
        // MONGO BACKUP:                     web_app: {
        // MONGO BACKUP:                         url: process.env.CLIENT_URL + "/chat"
        // MONGO BACKUP:                     }
        // MONGO BACKUP:                 }
        // MONGO BACKUP:             ]]
        // MONGO BACKUP:         }
        // MONGO BACKUP:     });
        // MONGO BACKUP: }

        const chat = await chatRepository.findByUserId(userId);
        if (chat) {
            const message = await chatRepository.addMessage(chat.id, {
                sender: 0,
                content,
                timestamp: new Date(),
                isSystemMessage: false,
            });
            
            const clientSocketId = clients.get(userId);
            if (clientSocketId) io.to(clientSocketId).emit('new_message', { ...message });
            
            const botToken = process.env.BOT_TOKEN;
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            
            await axios.post(url, {
                chat_id: userId,
                text: `В чате появилось новое сообщение.`,
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
    });

    socket.on('admin_order_status_changed', async (data: { orderId: string }) => {
        // MONGO BACKUP: if (!data.orderId) return;
        // MONGO BACKUP: 
        // MONGO BACKUP: const id = Number(data.orderId);
        // MONGO BACKUP: if (isNaN(id)) return;
        // MONGO BACKUP: 
        // MONGO BACKUP: const order = await Order.findOne({ _id: id });
        // MONGO BACKUP: if (!order) return;
        // MONGO BACKUP: 
        // MONGO BACKUP: const offer = await Offer.findOne({ _id: order.offerId });
        // MONGO BACKUP: const game = await Game.findOne({ _id: offer?.gameId });
        // MONGO BACKUP: const payment = await Payment.findOne({ orderId: order._id });
        // MONGO BACKUP: 
        // MONGO BACKUP: const orderMsg = `📦 *Order status changed*\n🆔 Order ID: ${order._id}\n🎮 Game: ${game?.title}\n🎮 Offer: ${offer?.title}\n💰 Amount: ${payment?.amountToPay} ${order.currency}\n📌 Status: ${order.status.toUpperCase()}\n🕒 Created: ${new Date(order.createdAt).toLocaleString()}\n🕒 Modified: ${new Date(order.updatedAt).toLocaleString()}\n`;
        // MONGO BACKUP: 
        // MONGO BACKUP: const message: IMessage = { sender: -1, content: orderMsg, timestamp: new Date(), isSystemMessage: true };
        // MONGO BACKUP: const message2: IMessage = { sender: -1, content: "Please leave a review for order №" + order._id, timestamp: new Date(), isSystemMessage: true };
        // MONGO BACKUP: 
        // MONGO BACKUP: let chat = await Chat.findOne({ userId: order.userId });
        // MONGO BACKUP: if (!chat) {
        // MONGO BACKUP:     chat = new Chat({
        // MONGO BACKUP:         userId: order.userId,
        // MONGO BACKUP:         messages: [message],
        // MONGO BACKUP:         lastReadByUser: new Date(),
        // MONGO BACKUP:         lastReadByAdmin: new Date(0),
        // MONGO BACKUP:         unreadAdminCount: 0,
        // MONGO BACKUP:     });
        // MONGO BACKUP: } else {
        // MONGO BACKUP:     chat.messages.push(message);
        // MONGO BACKUP:     chat.messages.push(message2);
        // MONGO BACKUP: }
        // MONGO BACKUP: await chat.save();
        // MONGO BACKUP: 
        // MONGO BACKUP: const clientSocketId = clients.get(order.userId);
        // MONGO BACKUP: if (clientSocketId) {
        // MONGO BACKUP:     io.to(clientSocketId).emit('new_message', { sender: -1, content: orderMsg });
        // MONGO BACKUP:     if (order.status === 'completed') io.to(clientSocketId).emit('new_message', { sender: -1, content: "Please leave a review for order №" + order._id });
        // MONGO BACKUP: }
        // MONGO BACKUP: 
        // MONGO BACKUP: if (order.status === 'completed') {
        // MONGO BACKUP:     const userId = order.userId;
        // MONGO BACKUP:     const referId = await Referral.findOne({ userId });
        // MONGO BACKUP:     const refer = await User.findOne({ _id: referId });
        // MONGO BACKUP: 
        // MONGO BACKUP:     if (referId && refer && payment) {
        // MONGO BACKUP:         const amountForRefer = (payment.amountToPay / 100) * refer.referralPercent;
        // MONGO BACKUP: 
        // MONGO BACKUP:         const botToken = process.env.BOT_TOKEN;
        // MONGO BACKUP:         const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        // MONGO BACKUP: 
        // MONGO BACKUP:         await axios.post(url, {
        // MONGO BACKUP:             chat_id: referId,
        // MONGO BACKUP:             text: `Поздравляем! Вы заработали ${amountForRefer + " " + payment.currency} за заказ, оформленный вашим рефералом ${userId}.`,
        // MONGO BACKUP:         });
        // MONGO BACKUP:     }
        // MONGO BACKUP: }
        // MONGO BACKUP: 
        // MONGO BACKUP: if (order.status === 'canceled') {
        // MONGO BACKUP:     const userId = order.userId;
        // MONGO BACKUP: 
        // MONGO BACKUP:     const botToken = process.env.BOT_TOKEN;
        // MONGO BACKUP:     const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        // MONGO BACKUP: 
        // MONGO BACKUP:     await axios.post(url, {
        // MONGO BACKUP:         chat_id: userId,
        // MONGO BACKUP:         text: `Заказ №${order._id} отменён.`,
        // MONGO BACKUP:     });
        // MONGO BACKUP: }
        // MONGO BACKUP: 
        // MONGO BACKUP: if (order.status === 'invalid') {
        // MONGO BACKUP:     const userId = order.userId;
        // MONGO BACKUP: 
        // MONGO BACKUP:     const botToken = process.env.BOT_TOKEN;
        // MONGO BACKUP:     const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        // MONGO BACKUP: 
        // MONGO BACKUP:     await axios.post(url, {
        // MONGO BACKUP:         chat_id: userId,
        // MONGO BACKUP:         text: `В заказе №${order._id} указаны неверные данные. Пожалуйста, перейдите в чат, чтобы обновить информацию.`,
        // MONGO BACKUP:         reply_markup: {
        // MONGO BACKUP:             inline_keyboard: [[
        // MONGO BACKUP:                 {
        // MONGO BACKUP:                     text: "💬 Чат",
        // MONGO BACKUP:                     web_app: {
        // MONGO BACKUP:                         url: process.env.CLIENT_URL + "/chat"
        // MONGO BACKUP:                     }
        // MONGO BACKUP:                 }
        // MONGO BACKUP:             ]]
        // MONGO BACKUP:         }
        // MONGO BACKUP:     });
        // MONGO BACKUP: }
        // MONGO BACKUP: 
        // MONGO BACKUP: const orders: IOrder[] = await Order.find();
        // MONGO BACKUP: socket.emit('orders_history', orders);
        // MONGO BACKUP: 
        // MONGO BACKUP: logger.info('New order notification sent via WebSocket', { context: { orderId: order._id } });

        if (!data.orderId) return;
        
        const id = Number(data.orderId);
        if (isNaN(id)) return;
        
        const order = await orderRepository.findById(id);
        if (!order) return;
        
        const game = order.offer?.game;
        const offer = order.offer;
        const payment = order.payment;
        
        const orderMsg = `📦 *Order status changed*\n🆔 Order ID: ${order.id}\n🎮 Game: ${game?.title}\n🎮 Offer: ${offer?.title}\n💰 Amount: ${payment?.amountToPay} ${order.currency}\n📌 Status: ${order.status.toUpperCase()}\n🕒 Created: ${new Date(order.createdAt).toLocaleString()}\n🕒 Modified: ${new Date(order.updatedAt).toLocaleString()}\n`;
        
        const chat = await chatRepository.findOrCreate(order.userId);
        
        await chatRepository.addMessage(chat.id, {
            sender: -1,
            content: orderMsg,
            timestamp: new Date(),
            isSystemMessage: true,
        });
        
        if (order.status === 'completed') {
            await chatRepository.addMessage(chat.id, {
                sender: -1,
                content: "Please leave a review for order №" + order.id,
                timestamp: new Date(),
                isSystemMessage: true,
            });
        }
        
        const clientSocketId = clients.get(order.userId);
        if (clientSocketId) {
            io.to(clientSocketId).emit('new_message', { sender: -1, content: orderMsg });
            if (order.status === 'completed') {
                io.to(clientSocketId).emit('new_message', { sender: -1, content: "Please leave a review for order №" + order.id });
            }
        }
        
        if (order.status === 'completed') {
            const userId = order.userId;
            const referral = await referralRepository.findByUserId(userId);
            const refer = referral ? await userRepository.findById(referral.referId) : null;
            
            if (refer && payment) {
                const amountForRefer = (payment.amountToPay / 100) * refer.referralPercent;
                
                const botToken = process.env.BOT_TOKEN;
                const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
                
                await axios.post(url, {
                    chat_id: refer.id,
                    text: `Поздравляем! Вы заработали ${amountForRefer + " " + payment.currency} за заказ, оформленный вашим рефералом ${userId}.`,
                });
            }
        }
        
        if (order.status === 'canceled') {
            const userId = order.userId;
            
            const botToken = process.env.BOT_TOKEN;
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            
            await axios.post(url, {
                chat_id: userId,
                text: `Заказ №${order.id} отменён.`,
            });
        }
        
        if (order.status === 'invalid') {
            const userId = order.userId;
            
            const botToken = process.env.BOT_TOKEN;
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            
            await axios.post(url, {
                chat_id: userId,
                text: `В заказе №${order.id} указаны неверные данные. Пожалуйста, перейдите в чат, чтобы обновить информацию.`,
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
        
        const orders = await orderRepository.findAll();
        socket.emit('orders_history', orders);
        
        logger.info('New order notification sent via WebSocket', { context: { orderId: order.id } });
    });

    socket.on('disconnect', () => {
        for (const [userId, id] of clients.entries()) {
            if (id === socket.id) {
                clients.delete(userId);
                break;
            }
        }
    });
});

// MONGO BACKUP: connectDB()
// MONGO BACKUP:     .then(() => {
// MONGO BACKUP:         // Listen on 0.0.0.0 to accept external traffic from Replit reverse proxy
// MONGO BACKUP:         httpServer.listen(PORT as number, '0.0.0.0', () => {
// MONGO BACKUP:             logger.info(`Server is running on port ${PORT} and accepting external connections`);
// MONGO BACKUP:         });
// MONGO BACKUP:     })
// MONGO BACKUP:     .catch((error) => {
// MONGO BACKUP:         logger.error('Failed to start server:', error);
// MONGO BACKUP:         process.exit(1);
// MONGO BACKUP:     });

// Start server with Prisma connection
connectDatabase()
    .then(() => {
        // Listen on 0.0.0.0 to accept external traffic from Replit reverse proxy
        httpServer.listen(PORT as number, '0.0.0.0', () => {
            logger.info(`Server is running on port ${PORT} and accepting external connections`);
        });
    })
    .catch((error) => {
        logger.error('Failed to start server:', error);
        process.exit(1);
    });

app.use('/api/games', gameRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-details', orderDetailsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
    // клиентская часть
    app.use(express.static(path.join(__dirname, '../../client/dist')));
    app.get('/', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });

    // админ-панель
    app.use('/admin', express.static(path.join(__dirname, '../../admin/dist')));
    app.get('/admin/*', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../admin/dist/index.html'));
    });
}

app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
