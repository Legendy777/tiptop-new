# Product Overview

This is a Telegram-based game store platform that enables users to purchase in-game items and currency through a web app interface integrated with Telegram.

## Core Features

- **Game Catalog**: Browse and search games with offers/packages
- **Purchase System**: Buy game items using RUB or USDT cryptocurrency
- **Referral Program**: Users earn commission from referred purchases
- **Order Management**: Track order status (pending, process, completed, canceled, invalid)
- **Live Chat**: Real-time support chat between users and admins via Socket.IO
- **Admin Panel**: Manage games, offers, orders, and user communications
- **Payment Integration**: Crypto Pay API for USDT payments
- **Review System**: Users can review completed orders
- **Withdrawal System**: Users can withdraw earned referral commissions

## User Flow

1. User opens Telegram bot and launches web app
2. Browses game catalog and selects offers
3. Fills order details (login, password, server, etc.)
4. Completes payment in RUB or USDT
5. Admin processes order and updates status
6. User receives notification and can leave review
7. Referrers earn commission on successful orders

## Architecture

- **Bot**: Telegram bot interface (Telegraf)
- **Client**: User-facing web app (React + Vite)
- **Admin**: Admin panel web app (React + Vite)
- **Server**: REST API + WebSocket server (Express + Socket.IO)
- **Database**: PostgreSQL with Prisma ORM
