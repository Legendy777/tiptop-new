import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Currency, Prisma } from '@prisma/client';

export class UserRepository {
  async findById(id: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          chat: true,
          referrals: true,
          referredBy: true,
        },
      });
      if (!user) {
        throw new NotFoundError('User', id);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find user by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.user.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all users', error);
    }
  }

  async create(data: Prisma.UserCreateInput) {
    try {
      return await prisma.user.create({
        data,
        include: {
          chat: true,
          referrals: true,
          referredBy: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create user', error);
    }
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update user', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete user', error);
    }
  }

  async findByUsername(username: string) {
    try {
      return await prisma.user.findFirst({
        where: { username },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find user by username', error);
    }
  }

  async findByTelegramId(telegramId: bigint | number) {
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
        include: {
          chat: true,
          referrals: true,
          referredBy: true,
        },
      });
      return user;
    } catch (error) {
      throw new DatabaseError('Failed to find user by telegram ID', error);
    }
  }

  async updateBalance(id: number, currency: Currency, amount: number) {
    try {
      const field = currency === 'RUB' ? 'balanceRUB' : 'balanceUSDT';
      return await prisma.user.update({
        where: { id },
        data: {
          [field]: {
            increment: amount,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update user balance', error);
    }
  }

  async incrementOrdersCount(id: number) {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          ordersCount: { increment: 1 },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to increment orders count', error);
    }
  }

  async updateSubscriptionStatus(id: number, isSubscribed: boolean) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { isSubscribed },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update subscription status', error);
    }
  }

  async setBanStatus(id: number, isBanned: boolean) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { isBanned },
      });
    } catch (error) {
      throw new DatabaseError('Failed to set ban status', error);
    }
  }

  async acceptPrivacyConsent(id: number) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { acceptedPrivacyConsent: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to accept privacy consent', error);
    }
  }

  async updateReferralPercent(id: number, percent: number) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { referralPercent: percent },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update referral percent', error);
    }
  }
}

export const userRepository = new UserRepository();
