import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({export const prisma = 
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
