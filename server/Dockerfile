FROM node:20-alpine
WORKDIR /app

# Install dependencies (includes dev deps for build)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Environment for production
ENV NODE_ENV=production
ENV PORT=3001

# Install OpenSSL (3.x) for Prisma on Alpine
RUN apk add --no-cache openssl

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build
RUN npx prisma migrate deploy

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
