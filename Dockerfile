FROM node:22

WORKDIR /app

COPY package*.json ./
COPY server ./server
COPY bot ./bot

RUN npm ci

# Сборка server и bot
RUN cd server && npm ci && npm run build
RUN cd bot && npm ci && npm run build

COPY . .

CMD ["node", "index.js"]
