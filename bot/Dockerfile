FROM node:20-alpine
WORKDIR /app

# Install all dependencies (including dev) to build TypeScript
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TS to dist/ (optional for production)
RUN npm run build || echo "Build failed or dist missing; starting with ts-node-dev"

ENV NODE_ENV=production
# Start directly from TypeScript to avoid missing dist/main.js issues
CMD ["npm", "run", "start:dev"]
