# Tip-Top Gaming Platform

## Overview

Tip-Top is a multi-component gaming marketplace platform built for Telegram, enabling users to browse games, purchase in-game offers, and interact with support through an integrated chat system. The platform consists of four main components:

1. **Client** - React-based Telegram Web App for end users
2. **Bot** - Telegraf-powered Telegram bot for user interaction
3. **Server** - Express.js backend API with Socket.IO for real-time features
4. **Admin** - React-based admin panel for managing games, offers, and orders

The platform supports multiple languages (Russian/English), cryptocurrency payments (USDT), and includes a referral system with rewards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Multi-Component Architecture

The application uses a monorepo structure with four distinct services that run concurrently:

- **Root Launcher** (`index.js`) - Orchestrates all four components, validates environment variables, and manages process lifecycle
- **Component Isolation** - Each service maintains its own dependencies, build process, and runtime configuration
- **Shared Environment** - Services communicate via environment variables and shared MongoDB database

### Frontend Architecture

**Client Application (Telegram Web App)**
- **Framework**: React 19 + TypeScript + Vite
- **State Management**: Redux Toolkit for centralized application state
- **Routing**: React Router v7 for navigation between pages
- **Styling**: Tailwind CSS v4 with custom theme
- **i18n**: react-i18next for Russian/English localization
- **Real-time**: Socket.IO client for chat functionality
- **Telegram Integration**: Telegram Web App SDK for native integration

**Admin Panel**
- **Framework**: React 19 + TypeScript + Vite
- **State Management**: Redux Toolkit (separate store from client)
- **Styling**: Tailwind CSS v4
- **Authentication**: Token-based auth with protected routes
- **Real-time**: Socket.IO for live order updates and chat management

### Backend Architecture

**Server (Express.js)**
- **Framework**: Express.js with TypeScript
- **Real-time Engine**: Socket.IO server for bidirectional communication
- **Session Management**: express-session with in-memory store
- **Request Handling**: Morgan for HTTP logging, Winston for application logging
- **CORS**: Configured for multiple allowed origins (client, admin, bot)
- **API Design**: RESTful routes organized by domain (games, offers, users, orders, etc.)

**Bot (Telegraf)**
- **Framework**: Telegraf v4 for Telegram Bot API
- **Language**: TypeScript with ts-node-dev for development
- **Architecture Patterns**:
  - Service layer pattern (UserService, GameService, MessageService)
  - Middleware pattern (rate limiting, user management, logging)
  - Centralized configuration (ConfigService)
  - Error handling (ErrorHandler with admin notifications)
- **Features**: Inline keyboards, subscription checks, slideshow banners, referral tracking

### Data Storage

**MongoDB with Mongoose ODM**
- **Database**: MongoDB Atlas (cloud-hosted)
- **Models**: 
  - User (authentication, balance, referral data)
  - Game (catalog items with metadata)
  - Offer (purchasable items linked to games)
  - Order (purchase records with status tracking)
  - Payment (transaction records)
  - Chat (support messages)
  - Review, Withdrawal, Referral, Transaction models
- **Schema Design**: Relational references between collections (e.g., Order → Offer → Game)

### Authentication & Authorization

**Multi-Layer Auth System**
- **Client**: Telegram InitData validation via `@telegram-apps/init-data-node`
- **Admin**: JWT token-based authentication with protected routes
- **Bot**: Internal API token (`AUTH_BOT_TOKEN`) for bot-to-server communication
- **Session Management**: Express sessions for maintaining user state

### Real-Time Communication

**Socket.IO Implementation**
- **Namespaces**: Default namespace for all real-time features
- **Events**:
  - `register_client` / `register_admin` - User/admin connection
  - `send_message` - Chat message exchange
  - `chat_history` - Historical messages delivery
  - `orders_history` - Live order updates
  - `order_status_update` - Status change notifications
- **Architecture**: Event-driven with separate handlers for client and admin connections

### Payment Integration

**Cryptocurrency Payments**
- **Provider**: CryptoPay API (`@foile/crypto-pay-api`)
- **Currency**: USDT (Tether)
- **Flow**: 
  1. Client creates payment intent via server API
  2. Server generates CryptoPay invoice
  3. User redirected to payment page
  4. Webhook confirms payment completion
- **Alternative**: RUB (Russian Ruble) payments via separate integration

### Internationalization (i18n)

**Multi-Language Support**
- **Libraries**: i18next + react-i18next
- **Languages**: Russian (default), English
- **Storage**: JSON locale files (`/client/src/locales/`)
- **User Preference**: Stored in database, synced on login
- **Coverage**: All user-facing strings in client and bot

### Build & Deployment

**Development Workflow**
- **Concurrent Execution**: Root `package.json` uses custom launcher to run all services
- **Hot Reload**: Each service uses its own dev server (Vite for frontends, ts-node-dev for backend/bot)
- **Type Safety**: TypeScript across all components with strict mode enabled

**Production Build**
- **Build Script**: `bash build-all.sh` compiles all TypeScript projects
- **Output**: Compiled JavaScript in respective `dist/` directories
- **Start Command**: `node index.js` launches all services via production-ready process spawner

**Replit-Specific Configuration**
- **Port**: Uses Replit's `PORT` environment variable (default 5000)
- **URL Detection**: Automatically constructs `CLIENT_URL` from `REPL_SLUG` and `REPL_OWNER`
- **Secrets**: Sensitive data stored in Replit Secrets (not `.env` files)

## External Dependencies

### Third-Party Services

**MongoDB Atlas**
- **Purpose**: Primary database (NoSQL document store)
- **Configuration**: Connection via `MONGODB_URI` environment variable
- **Free Tier**: M0 cluster suitable for development and small-scale production

**Telegram Bot API**
- **Purpose**: Bot messaging, user authentication, Web App hosting
- **Requirements**: 
  - `BOT_TOKEN` from @BotFather
  - `BOT_USERNAME` for inline queries
  - `ADMIN_ID` for error notifications
- **Integration**: Telegraf library wraps API calls

**CryptoPay (Crypto Payment Gateway)**
- **Purpose**: USDT cryptocurrency payment processing
- **Library**: `@foile/crypto-pay-api`
- **Configuration**: API token in environment variables

### Key NPM Packages

**Backend**
- `express` - HTTP server framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time bidirectional communication
- `telegraf` - Telegram Bot API wrapper
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `winston` - Application logging
- `axios` - HTTP client for external APIs

**Frontend (Client & Admin)**
- `react` + `react-dom` - UI framework
- `@reduxjs/toolkit` - State management
- `react-router-dom` - Client-side routing
- `socket.io-client` - Real-time client
- `axios` - API requests
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Icon library
- `i18next` - Internationalization

**Development**
- `typescript` - Type safety
- `vite` - Frontend build tool
- `ts-node-dev` - TypeScript execution with hot reload
- `eslint` - Code linting
- `concurrently` / `npm-run-all` - Multi-process orchestration

### Environment Variables

**Required**
- `BOT_TOKEN` - Telegram bot authentication token
- `BOT_USERNAME` - Bot's @username
- `ADMIN_ID` - Telegram ID of admin for notifications
- `MONGODB_URI` - MongoDB connection string
- `AUTH_BOT_TOKEN` - Internal API authentication

**Optional/Auto-Generated**
- `PORT` - Server port (defaults to 3000, Replit sets to 5000)
- `CLIENT_URL` - Frontend URL (auto-constructed on Replit)
- `CHANNEL_URL` - Telegram channel for subscription checks
- `API_URL` - Backend API base URL

### Deployment Platform

**Replit Hosting**
- **Advantages**: 
  - Zero-configuration deployment
  - Built-in environment management (Secrets)
  - Automatic HTTPS and domain provisioning
  - Always-on hosting for web services
- **Configuration**: `.replit` file defines run command and environment
- **Limitations**: Single-region deployment, shared resources on free tier