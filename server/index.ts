import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import http from 'http'; // CHANGED: Was https, now http
import { Server } from 'socket.io';

import { connectDatabase, chatRepository, orderRepository, gameRepository, offerRepository, paymentRepository, referralRepository, userRepository, prisma } from './src/db';
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
import kiroRoutes from './src/routes/kiroRoutes';

import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Use 3001 by default to match Docker compose
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

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

        try {
            const user = await userRepository.findByTelegramId(userId);
            if (!user) {
                socket.emit('chat_history', []);
                socket.emit('unread_count', 0);
                return;
            }

            let chat = await chatRepository.findByUserId(user.id);
            
            if (chat) {
                await chatRepository.markAsReadByUser(chat.id);
                await chatRepository.update(chat.id, { 
                    unreadAdminCount: 0 
                });
                
                const messages = await chatRepository.getMessages(chat.id);
                
                socket.emit('chat_history', messages);

                const lastRead = chat.lastReadByUser || new Date(0);
                const unreadCount = messages.filter(
                    m => m.timestamp > lastRead && m.sender === 0
                ).length;
                socket.emit('unread_count', unreadCount);
            } else {
                socket.emit('chat_history', []);
                socket.emit('unread_count', 0);
            }
        } catch (error) {
            logger.error('Error in register_client', { error, userId });
            socket.emit('chat_history', []);
            socket.emit('unread_count', 0);
        }
    });

    socket.on('register_admin', async () => {
        socket.join('admin');
        
        try {
            const allChats = await chatRepository.findAll();
            const chatMap: Record<number, any[]> = {};
            const unreadCounts: Record<number, number> = {};

            for (const chat of allChats) {
                const messages = await chatRepository.getMessages(chat.id);
                chatMap[Number(chat.user.telegramId)] = messages;
                unreadCounts[Number(chat.user.telegramId)] = chat.unreadAdminCount;
            }

            const orders = await orderRepository.findAll();

            socket.emit('chat_history', chatMap);
            socket.emit('orders_history', orders);
            socket.emit('unread_counts', unreadCounts);
        } catch (error) {
            logger.error('Error in register_admin', { error });
            socket.emit('chat_history', {});
            socket.emit('orders_history', []);
            socket.emit('unread_counts', {});
        }
    });

    socket.on('admin_select_chat', async (userId: number) => {
        try {
            const user = await userRepository.findByTelegramId(userId);
            if (!user) return;

            const chat = await chatRepository.findByUserId(user.id);
            if (chat) {
                await chatRepository.markAsReadByAdmin(chat.id);
                const messages = await chatRepository.getMessages(chat.id);

                socket.emit('chat_history', messages);
                socket.emit('unread_count', 0);

                io.to('admin').emit('update_unread_count', { userId, unreadAdmin: 0 });
            }
        } catch (error) {
            logger.error('Error in admin_select_chat', { error, userId });
        }
    });

    socket.on('send_message', async ({ sender, userId, content }) => {
        try {
            const user = await userRepository.findByTelegramId(userId);
            if (!user) {
                logger.error('User not found in send_message', { userId });
                return;
            }

            let chat = await chatRepository.findByUserId(user.id);
            
            if (!chat) {
                chat = await chatRepository.create({
                    user: { connect: { id: user.id } },
                    lastReadByUser: new Date(),
                    lastReadByAdmin: new Date(0),
                    unreadAdminCount: sender !== 0 ? 1 : 0,
                    messages: {
                        create: {
                            sender,
                            content,
                            timestamp: new Date(),
                            isSystemMessage: false,
                        }
                    }
                });
            } else {
                await chatRepository.addMessage(chat.id, {
                    sender,
                    content,
                    timestamp: new Date(),
                    isSystemMessage: false,
                });

                if (sender !== 0) {
                    await chatRepository.incrementUnreadAdminCount(chat.id);
                }
            }

            const updatedChat = await chatRepository.findByUserId(user.id);
            const message = {
                sender,
                content,
                timestamp: new Date(),
                isSystemMessage: false,
            };

            io.to('admin').emit('new_message', { 
                ...message, 
                userId, 
                unreadAdmin: updatedChat?.unreadAdminCount || 0 
            });
        } catch (error) {
            logger.error('Error in send_message', { error, userId, content });
        }
    });

    socket.on('admin_reply', async ({ userId, content }) => {
        try {
            const user = await userRepository.findByTelegramId(userId);
            if (!user) {
                logger.error('User not found in admin_reply', { userId });
                return;
            }

            let chat = await chatRepository.findByUserId(user.id);
            
            if (!chat) {
                chat = await chatRepository.create({
                    user: { connect: { id: user.id } },
                    lastReadByUser: new Date(0),
                    lastReadByAdmin: new Date(),
                    unreadAdminCount: 0,
                });
            }

            await chatRepository.addMessage(chat.id, {
                sender: 0,
                content,
                timestamp: new Date(),
                isSystemMessage: false,
            });

            const message = { 
                sender: 0, 
                content, 
                timestamp: new Date(), 
                isSystemMessage: false 
            };

            const clientSocketId = clients.get(userId);
            if (clientSocketId) {
                io.to(clientSocketId).emit('new_message', message);
            }

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
        } catch (error) {
            logger.error('Error in admin_reply', { error, userId, content });
        }
    });

    socket.on('admin_order_status_changed', async (data: { orderId: string }) => {
        if (!data.orderId) return;

        const id = Number(data.orderId);
        if (isNaN(id)) return;

        try {
            const order = await orderRepository.findById(id);
            if (!order) return;

            const offer = await offerRepository.findById(order.offerId);
            const game = offer ? await gameRepository.findById(offer.gameId) : null;
            
            // Find payment by orderId
            const payment = order.payment || await prisma.payment.findFirst({
                where: { orderId: order.id },
                include: {
                    offer: {
                        include: {
                            game: true,
                        },
                    },
                },
            });

            const orderMsg = `📦 *Order status changed*\n🆔 Order ID: ${order.id}\n🎮 Game: ${game?.title || 'Unknown'}\n🎮 Offer: ${offer?.title || 'Unknown'}\n💰 Amount: ${payment?.amountToPay || 0} ${order.currency}\n📌 Status: ${order.status.toUpperCase()}\n🕒 Created: ${new Date(order.createdAt).toLocaleString()}\n🕒 Modified: ${new Date(order.updatedAt).toLocaleString()}\n`;

            const user = await userRepository.findById(order.userId);
            if (!user) return;

            let chat = await chatRepository.findByUserId(user.id);
            
            if (!chat) {
                chat = await chatRepository.create({
                    user: { connect: { id: user.id } },
                    lastReadByUser: new Date(),
                    lastReadByAdmin: new Date(0),
                    unreadAdminCount: 0,
                });
            }

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

            const clientSocketId = clients.get(Number(user.telegramId));
            if (clientSocketId) {
                io.to(clientSocketId).emit('new_message', { sender: -1, content: orderMsg });
                if (order.status === 'completed') {
                    io.to(clientSocketId).emit('new_message', { 
                        sender: -1, 
                        content: "Please leave a review for order №" + order.id 
                    });
                }
            }

            if (order.status === 'completed' && payment) {
                const referral = await referralRepository.findByUserId(order.userId);
                
                if (referral && payment) {
                    const referrer = await userRepository.findById(referral.referId);
                    
                    if (referrer) {
                        const amountForRefer = Number(payment.amountToPay) / 100 * Number(referrer.referralPercent);

                        const botToken = process.env.BOT_TOKEN;
                        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

                        await axios.post(url, {
                            chat_id: Number(referrer.telegramId),
                            text: `Поздравляем! Вы заработали ${amountForRefer} ${payment.currency} за заказ, оформленный вашим рефералом ${user.telegramId}.`,
                        });
                    }
                }
            }

            if (order.status === 'canceled') {
                const botToken = process.env.BOT_TOKEN;
                const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

                await axios.post(url, {
                    chat_id: Number(user.telegramId),
                    text: `Заказ №${order.id} отменён.`,
                });
            }

            if (order.status === 'invalid') {
                const botToken = process.env.BOT_TOKEN;
                const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

                await axios.post(url, {
                    chat_id: Number(user.telegramId),
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
        } catch (error) {
            logger.error('Error in admin_order_status_changed', { error, orderId: id });
        }
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

// Start server without blocking on database connection
// Database connection will be retried in the background
async function ensureMinimalOffers() {
  try {
    const games = await prisma.game.findMany();
    for (const game of games) {
      const count = await prisma.offer.count({ where: { gameId: game.id } });
      if (count === 0) {
        await prisma.offer.create({
          data: {
            title: 'Starter Pack',
            imageUrl: game.imageUrl,
            priceRUB: 199,
            priceUSDT: 2,
            isEnabled: true,
            game: { connect: { id: game.id } },
          },
        });
        logger.info('Seeded starter offer for game', { context: { gameId: game.id } });
      }
    }
  } catch (error: any) {
    logger.warn('Auto-seed offers failed', { error: error?.message || String(error) });
  }
}

connectDatabase()
  .then(async () => {
    logger.info('✅ Database connection successful');
    await ensureMinimalOffers();
  })
  .catch((error) => {
    logger.warn('⚠️ Failed to connect to database on startup:', error.message);
    logger.warn('Server will continue running - database retries will be attempted');
  })
  .finally(() => {
    // Start server regardless of database connection status
    httpServer.listen(PORT as number, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT} and accepting external connections`);
    });
  })  

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

// Healthcheck: verifies API and database connectivity
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        // Simple DB ping and entity counts
        await prisma.$queryRaw`SELECT 1`;
        const gamesCount = await prisma.game.count();
        const offersCount = await prisma.offer.count();
        const usersCount = await prisma.user.count();
        res.json({ ok: true, database: true, counts: { games: gamesCount, offers: offersCount, users: usersCount } });
    } catch (error: any) {
        res.status(500).json({ ok: false, database: false, error: error?.message || String(error) });
    }
});

// Env check: reports presence (not values) of critical variables
app.get('/api/health/env', (req: Request, res: Response) => {
    const present = (name: string) => Boolean(process.env[name]);
    res.json({
        ok: true,
        env: {
            DATABASE_URL: present('DATABASE_URL'),
            CLIENT_URL: present('CLIENT_URL'),
            WEB_APP_URL: present('WEB_APP_URL'),
            VITE_API_URL: present('VITE_API_URL'),
            BOT_TOKEN: present('BOT_TOKEN'),
            ADMIN_SECRET: present('ADMIN_SECRET'),
        }
    });
});

// Quick seed: заполняет БД реальными играми и офферами
app.post('/api/seed/quick', async (req: Request, res: Response) => {
    const providedSecret = (req.headers['x-admin-secret'] as string) || (req.query.secret as string) || (req.body as any)?.secret;
    if (!ADMIN_SECRET || providedSecret !== ADMIN_SECRET) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
    }
    try {
        const { execSync } = require('child_process');
        const output = execSync('node scripts/seed-games.js', { 
            cwd: __dirname,
            encoding: 'utf-8' 
        });
        
        const gamesCount = await prisma.game.count();
        const offersCount = await prisma.offer.count();
        
        res.json({ 
            ok: true, 
            message: 'Database seeded successfully',
            output,
            counts: { games: gamesCount, offers: offersCount }
        });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error?.message || String(error) });
    }
});

// Minimal seed: creates demo Game and Offer if not exist (protected)
app.post('/api/seed/minimal', async (req: Request, res: Response) => {
    const providedSecret = (req.headers['x-admin-secret'] as string) || (req.query.secret as string) || (req.body as any)?.secret;
    if (!ADMIN_SECRET || providedSecret !== ADMIN_SECRET) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
    }
    try {
        await prisma.$queryRaw`SELECT 1`;
        let game = await prisma.game.findFirst();
        if (!game) {
            game = await prisma.game.create({
                data: {
                    title: 'Demo Game',
                    imageUrl: 'https://via.placeholder.com/800x400?text=Demo+Game',
                    gifUrl: process.env.DEFAULT_GIF_URL || 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
                    appleStoreUrl: process.env.DEFAULT_APP_STORE_URL || 'https://www.apple.com/app-store/',
                    googlePlayUrl: process.env.DEFAULT_GOOGLE_PLAY_URL || 'https://play.google.com',
                    trailerUrl: 'https://www.youtube.com/',
                    hasDiscount: false,
                    isActual: true,
                    isEnabled: true,
                }
            });
        }
        const existingOffer = await prisma.offer.findFirst({ where: { gameId: game.id } });
        if (!existingOffer) {
            await prisma.offer.create({
                data: {
                    title: 'Starter Pack',
                    imageUrl: game.imageUrl,
                    priceRUB: 100,
                    priceUSDT: 1,
                    isEnabled: true,
                    game: { connect: { id: game.id } }
                }
            });
        }
        const counts = {
            games: await prisma.game.count(),
            offers: await prisma.offer.count(),
            users: await prisma.user.count(),
        };
        res.json({ ok: true, seeded: true, counts });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error?.message || String(error) });
    }
});

// Seed offers for a specific game (protected by ADMIN_SECRET)
async function seedOfferForGame(gameId: number) {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error(`Game id=${gameId} not found`);
    const existingOffer = await prisma.offer.findFirst({ where: { gameId } });
    if (existingOffer) return existingOffer;
    return prisma.offer.create({
        data: {
            title: 'Starter Pack',
            imageUrl: game.imageUrl,
            priceRUB: 199,
            priceUSDT: 2,
            isEnabled: true,
            game: { connect: { id: gameId } }
        }
    });
}

app.post('/api/seed/offers/:gameId', async (req: Request, res: Response) => {
    const providedSecret = (req.headers['x-admin-secret'] as string) || (req.query.secret as string) || (req.body as any)?.secret;
    if (!ADMIN_SECRET || providedSecret !== ADMIN_SECRET) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
    }
    try {
        const gameId = Number(req.params.gameId);
        const offer = await seedOfferForGame(gameId);
        res.json({ ok: true, offer });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error?.message || String(error) });
    }
});

// Convenience GET alias for quick testing
app.get('/api/seed/offers/:gameId', async (req: Request, res: Response) => {
    const providedSecret = (req.query.secret as string) || '';
    if (!ADMIN_SECRET || providedSecret !== ADMIN_SECRET) {
        return res.status(403).json({ ok: false, message: 'Forbidden' });
    }
    try {
        const gameId = Number(req.params.gameId);
        const offer = await seedOfferForGame(gameId);
        res.json({ ok: true, offer });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error?.message || String(error) });
    }
});

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
    app.get('*', (req: Request, res: Response, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path.startsWith('/socket.io')) return next();
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
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
