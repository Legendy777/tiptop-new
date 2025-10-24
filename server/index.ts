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

import { connectDB } from './src/config/database';
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

import { Chat, IMessage } from "./src/models/Chat";
import Order, { IOrder } from "./src/models/Order";
import Offer from "./src/models/Offer";
import Game from "./src/models/Game";
import Payment from "./src/models/Payment";
import process from "node:process";
import Referral from "./src/models/Referral";
import User from "./src/models/User";
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

        let chat = await Chat.findOne({ userId });
        if (chat) {
            chat.lastReadByUser = new Date();
            chat.unreadAdminCount = 0;
            await chat.save();

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
        const allChats = await Chat.find({});
        const chatMap: Record<number, IMessage[]> = {};
        const unreadCounts: Record<number, number> = {};

        allChats.forEach(chat => {
            chatMap[chat.userId] = chat.messages;
            unreadCounts[chat.userId] = chat.unreadAdminCount;
        });

        const orders: IOrder[] = await Order.find();

        socket.emit('chat_history', chatMap);
        socket.emit('orders_history', orders);
        socket.emit('unread_counts', unreadCounts);
    });

    socket.on('admin_select_chat', async (userId: number) => {
        const chat = await Chat.findOne({ userId });
        if (chat) {
            chat.lastReadByAdmin = new Date();
            chat.unreadAdminCount = 0;
            await chat.save();

            socket.emit('chat_history', chat.messages);
            socket.emit('unread_count', 0);

            io.to('admin').emit('update_unread_count', { userId, unreadAdmin: 0 });
        }
    });

    socket.on('send_message', async ({ sender, userId, content }) => {
        const message: IMessage = { sender, content, timestamp: new Date(), isSystemMessage: false };

        let chat = await Chat.findOne({ userId });
        if (!chat) {
            chat = new Chat({
                userId,
                messages: [message],
                lastReadByUser: new Date(),
                lastReadByAdmin: new Date(0),
                unreadAdminCount: sender !== 0 ? 1 : 0,
            });
        } else {
            chat.messages.push(message);
            if (sender !== 0) chat.unreadAdminCount = (chat.unreadAdminCount || 0) + 1;
        }
        await chat.save();

        io.to('admin').emit('new_message', { ...message, userId, unreadAdmin: chat.unreadAdminCount });
    });

    socket.on('admin_reply', async ({ userId, content }) => {
        const message: IMessage = { sender: 0, content, timestamp: new Date(), isSystemMessage: false };
        const chat = await Chat.findOne({ userId });
        if (chat) {
            chat.messages.push(message);
            await chat.save();

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
        if (!data.orderId) return;

        const id = Number(data.orderId);
        if (isNaN(id)) return;

        const order = await Order.findOne({ _id: id });
        if (!order) return;

        const offer = await Offer.findOne({ _id: order.offerId });
        const game = await Game.findOne({ _id: offer?.gameId });
        const payment = await Payment.findOne({ orderId: order._id });

        const orderMsg = `📦 *Order status changed*\n🆔 Order ID: ${order._id}\n🎮 Game: ${game?.title}\n🎮 Offer: ${offer?.title}\n💰 Amount: ${payment?.amountToPay} ${order.currency}\n📌 Status: ${order.status.toUpperCase()}\n🕒 Created: ${new Date(order.createdAt).toLocaleString()}\n🕒 Modified: ${new Date(order.updatedAt).toLocaleString()}\n`;

        const message: IMessage = { sender: -1, content: orderMsg, timestamp: new Date(), isSystemMessage: true };
        const message2: IMessage = { sender: -1, content: "Please leave a review for order №" + order._id, timestamp: new Date(), isSystemMessage: true };

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
            chat.messages.push(message2);
        }
        await chat.save();

        const clientSocketId = clients.get(order.userId);
        if (clientSocketId) {
            io.to(clientSocketId).emit('new_message', { sender: -1, content: orderMsg });
            if (order.status === 'completed') io.to(clientSocketId).emit('new_message', { sender: -1, content: "Please leave a review for order №" + order._id });
        }

        if (order.status === 'completed') {
            const userId = order.userId;
            const referId = await Referral.findOne({ userId });
            const refer = await User.findOne({ _id: referId });

            if (referId && refer && payment) {
                const amountForRefer = (payment.amountToPay / 100) * refer.referralPercent;

                const botToken = process.env.BOT_TOKEN;
                const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

                await axios.post(url, {
                    chat_id: referId,
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
                text: `Заказ №${order._id} отменён.`,
            });
        }

        if (order.status === 'invalid') {
            const userId = order.userId;

            const botToken = process.env.BOT_TOKEN;
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

            await axios.post(url, {
                chat_id: userId,
                text: `В заказе №${order._id} указаны неверные данные. Пожалуйста, перейдите в чат, чтобы обновить информацию.`,
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

        const orders: IOrder[] = await Order.find();
        socket.emit('orders_history', orders);

        logger.info('New order notification sent via WebSocket', { context: { orderId: order._id } });
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

connectDB()
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
