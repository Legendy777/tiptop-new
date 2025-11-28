import process from 'node:process';
import { prisma } from './client';

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

export * from '@prisma/client';

// Connection helper - PostgreSQL only
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

// Disconnect helper
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
