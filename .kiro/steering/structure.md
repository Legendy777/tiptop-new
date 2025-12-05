# Project Structure

## Monorepo Layout

This is a monorepo with 4 independent services that work together:

```
/
├── server/          # Express API + Socket.IO backend
├── client/          # User-facing React web app
├── admin/           # Admin panel React web app
├── bot/             # Telegram bot (Telegraf)
├── scripts/         # Utility scripts (auto-tunnel.js)
├── nginx/           # Nginx configuration
├── cloudflared/     # Cloudflare tunnel configs
└── docker-compose.yml
```

## Server Structure (`/server`)

```
server/
├── src/
│   ├── config/           # Database, logger configuration
│   ├── controllers/      # Request handlers (adminController, orderController, etc.)
│   ├── db/
│   │   ├── client.ts     # Prisma client singleton
│   │   └── repositories/ # Data access layer (user.ts, order.ts, game.ts, etc.)
│   ├── middleware/       # Auth, admin middleware
│   ├── models/           # TypeScript interfaces/types
│   ├── routes/           # Express route definitions
│   ├── helpers/          # Utility functions
│   └── types/            # Type definitions
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data script
├── logs/                 # Winston logs (combined.log, error.log)
├── ssl/                  # SSL certificates
└── index.ts              # Entry point
```

### Server Patterns

- **Repository Pattern**: All database access goes through `src/db/repositories/`
- **Controller Layer**: Business logic in `src/controllers/`
- **Middleware**: Auth validation in `src/middleware/auth.ts` and `admin.ts`
- **Error Handling**: Centralized error responses in controllers
- **Logging**: Winston logger configured in `src/config/logger.ts`

## Client Structure (`/client`)

```
client/
├── src/
│   ├── api/              # Axios instance configuration
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route pages (Home, Orders, Profile, etc.)
│   ├── store/
│   │   ├── store.ts      # Redux store configuration
│   │   └── features/     # Redux slices (gamesSlice, ordersSlice, etc.)
│   ├── locales/          # i18n translations (en.json, ru.json)
│   ├── utils/            # Utility functions (telegram.ts)
│   ├── types/            # TypeScript type definitions
│   ├── mock/             # Mock data for development
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── i18n.ts           # i18next configuration
├── public/               # Static assets (images, GIFs)
└── index.html
```

### Client Patterns

- **Redux Toolkit**: State management with slices per domain
- **React Router v7**: Client-side routing
- **Axios Interceptors**: Centralized API calls with auth headers
- **i18next**: Multi-language support (EN/RU)
- **Telegram WebApp SDK**: Integration via `window.Telegram.WebApp`

## Admin Structure (`/admin`)

```
admin/
├── src/
│   ├── api/              # Axios instance
│   ├── components/       # UI components (ChatsPanel, OrdersPanel, forms)
│   ├── pages/            # AdminLogin, AdminPanel
│   ├── store/
│   │   ├── store.ts
│   │   └── features/     # Redux slices (authSlice, gamesSlice, etc.)
│   ├── App.tsx
│   └── main.tsx
└── index.html
```

### Admin Patterns

- **Protected Routes**: `ProtectedRoute` component wraps authenticated pages
- **Redux Toolkit**: Similar structure to client
- **Socket.IO**: Real-time chat with users
- **React Router v6**: Routing (older version than client)

## Bot Structure (`/bot`)

```
bot/
├── src/
│   ├── config/           # Config service, localization
│   ├── handlers/         # Command handlers (start, callback)
│   ├── middleware/       # Logger, rate limiter, user middleware
│   ├── services/         # Business logic (game, message, user services)
│   ├── utils/            # Error handler, notifications, subscriptions
│   ├── types/            # Type definitions
│   └── main.ts           # Bot entry point
└── tsconfig.json
```

### Bot Patterns

- **Telegraf Framework**: Scene-based bot architecture
- **Middleware Chain**: Rate limiting → user validation → handlers
- **Service Layer**: API calls to server in `src/services/`
- **Localization**: Multi-language support in `src/config/localization.ts`

## Key Conventions

### File Naming
- **TypeScript**: camelCase for files (e.g., `userController.ts`, `gameService.ts`)
- **React Components**: PascalCase (e.g., `OrdersPanel.tsx`, `Header.tsx`)
- **Config Files**: kebab-case (e.g., `docker-compose.yml`, `eslint.config.js`)

### Import Patterns
- Use relative imports within same service
- No path aliases configured (use `../../` style imports)
- Import types with `import type` when possible

### Code Organization
- **Controllers**: Handle HTTP requests, call repositories, return responses
- **Repositories**: Direct database access via Prisma
- **Services**: Business logic, external API calls
- **Models**: TypeScript interfaces matching Prisma schema

### Database Access
- Always use Prisma client through repositories
- Never write raw SQL
- Use transactions for multi-step operations
- Repository functions return Prisma types

### API Communication
- Server exposes REST API on `/api/*` routes
- Bot authenticates with `AUTH_BOT_TOKEN` header
- Client/Admin use JWT tokens from Telegram initData
- WebSocket for real-time chat on `/socket.io`

### Environment Variables
- Each service reads from process.env
- Docker Compose injects variables
- No `.env` files in version control
- Required vars documented in tech.md
