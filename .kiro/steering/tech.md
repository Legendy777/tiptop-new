# Technology Stack

## Build System

- **Monorepo**: Root workspace with 4 sub-projects (server, client, admin, bot)
- **Package Manager**: npm
- **Build Tool**: TypeScript compiler + Vite (for frontends)
- **Deployment**: Docker Compose with multi-stage builds

## Tech Stack by Service

### Server (Express API)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **WebSocket**: Socket.IO for real-time chat
- **Auth**: JWT + Telegram initData validation (@telegram-apps/init-data-node)
- **Logging**: Winston
- **Payment**: @foile/crypto-pay-api for USDT

### Client (User Web App)
- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **State**: Redux Toolkit
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **i18n**: i18next + react-i18next
- **HTTP**: Axios
- **WebSocket**: socket.io-client

### Admin (Admin Panel)
- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **State**: Redux Toolkit
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **HTTP**: Axios
- **WebSocket**: socket.io-client

### Bot (Telegram Bot)
- **Framework**: Telegraf v4
- **Runtime**: Node.js with TypeScript
- **HTTP**: Axios for API calls

## Common Commands

### Root Level
```bash
npm run build              # Build all services
npm run build:server       # Build server only
npm run build:client       # Build client only
npm run build:admin        # Build admin only
npm run build:bot          # Build bot only
npm run dev                # Run development (index.js)
```

### Server
```bash
cd server
npm run dev                # Development with ts-node-dev
npm run build              # Compile TypeScript + generate Prisma client
npm run start              # Run production build
npx prisma migrate dev     # Run database migrations
npx prisma generate        # Generate Prisma client
npm run seed               # Seed mock data
```

### Client / Admin
```bash
cd client  # or cd admin
npm run dev                # Start Vite dev server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

### Bot
```bash
cd bot
npm run dev                # Development with ts-node-dev
npm run build              # Compile TypeScript
npm run start              # Run production build
```

### Docker
```bash
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

## Environment Variables

Required variables are defined in docker-compose.yml and should be set via .env file:
- `BOT_TOKEN`: Telegram bot token
- `BOT_USERNAME`: Telegram bot username
- `ADMIN_ID`: Telegram admin user ID
- `WEB_APP_URL`: Public HTTPS URL for web app
- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_SECRET`: Secret for admin endpoints
- `AUTH_BOT_TOKEN`: Bot-to-server authentication token

## Database

- **ORM**: Prisma
- **Schema**: server/prisma/schema.prisma
- **Migrations**: server/prisma/migrations/
- Prisma generates TypeScript types automatically
- Use repositories pattern (server/src/db/repositories/)
