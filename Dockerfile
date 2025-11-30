FROM node:22

WORKDIR /app

# Корневой package.json и lock
COPY package.json package-lock.json ./

# server и bot манифесты
COPY server/package.json server/package-lock.json ./server/
COPY bot/package.json bot/package-lock.json ./bot/

# deps в корне
RUN npm ci

# Сборка сервера
WORKDIR /app/server
RUN npm ci && npm run build

# Сборка бота
WORKDIR /app/bot
RUN npm ci && npm run build

# Возвращаемся в корень и докидываем всё остальное
WORKDIR /app
COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
