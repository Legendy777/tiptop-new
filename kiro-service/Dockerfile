FROM node:20-alpine

WORKDIR /app

# Установка Kiro CLI
RUN npm install -g @kiroai/cli

# Копирование конфигурации проекта
COPY package*.json ./
COPY .kiro ./kiro

# Установка зависимостей проекта
RUN npm ci --only=production

# Скрипт для запуска Kiro сервиса
COPY kiro-service/server.js ./

EXPOSE 3002

CMD ["node", "server.js"]
