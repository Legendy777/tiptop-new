import process from 'node:process';

export { prisma } from './client';

export {
  DatabaseError,
  NotFoundError,
  ValidationError,
} from './error';

export { userRepository, UserRepository } from './repositories/user';
export { gameRepository, GameRepository } from './repositories/game';
export { offerRepository, OfferRepository } from './repositories/offer';
export { orderRepository, OrderRepository } from './repositories/order';
export { paymentRepository, PaymentRepository } from './repositories/payment';
export { chatRepository, ChatRepository } from './repositories/chat';
export { reviewRepository, ReviewRepository } from './repositories/review';
export { referralRepository, ReferralRepository } from './repositories/referral';
export { transactionRepository, TransactionRepository } from './repositories/transaction';
export { withdrawalRepository, WithdrawalRepository } from './repositories/withdrawal';

export * from '../../generated/prisma';

// Database selection switch - read from environment
export const USE_POSTGRES = process.env.USE_POSTGRES === 'true';

// Connection helper
export async function connectDatabase() {
  if (USE_POSTGRES) {
    // Test Prisma connection
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL connected successfully via Prisma');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error);
      throw error;
    }
  } else {
    console.warn('⚠️  MongoDB is disabled. Set USE_POSTGRES=true to use PostgreSQL.');
    return false;
  }
}

// Disconnect helper
export async function disconnectDatabase() {
  if (USE_POSTGRES) {
    await prisma.$disconnect();
  }
}
