import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Формируем URL из переменных Railway если DATABASE_URL не установлен
const getDatabaseUrl = (): string => {
console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
    if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Fallback: составляем из отдельных переменных
  if (process.env.DATABASE_HOST && process.env.DATABASE_USER && process.env.DATABASE_PASSWORD && process.env.DATABASE_NAME && process.env.DATABASE_PORT) {
    return `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;
  }

  throw new Error('DATABASE_URL or DATABASE_* variables must be set');
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
