FROM node:22

# Рабочая директория
WORKDIR /app

# Копируем корневые зависимости
COPY package.json package-lock.json ./
RUN npm ci

# Копируем весь проект (включая server и bot)
COPY . .

# ==== Сборка клиента ====
WORKDIR /app/client
RUN npm ci && npm run build

# ==== Сборка админки ====
WORKDIR /app/admin
RUN npm ci && npm run build

# ==== Сборка сервера ====
WORKDIR /app/server
RUN npm ci && npm run build

# ==== Сборка бота ====
WORKDIR /app/bot
RUN npm ci && npm run build

# Возвращаемся в корень
WORKDIR /app

EXPOSE 8080
CMD ["node", "index.js"]
