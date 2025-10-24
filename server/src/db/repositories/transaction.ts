import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Currency, TransactionType, Prisma } from '../../../generated/prisma';

export class TransactionRepository {
  async findById(id: number) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          user: true,
          referrer: true,
        },
      });
      if (!transaction) {
        throw new NotFoundError('Transaction', id);
      }
      return transaction;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find transaction by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.transaction.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all transactions', error);
    }
  }

  async create(data: Prisma.TransactionCreateInput) {
    try {
      return await prisma.transaction.create({
        data,
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create transaction', error);
    }
  }

  async update(id: number, data: Prisma.TransactionUpdateInput) {
    try {
      return await prisma.transaction.update({
        where: { id },
        data,
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update transaction', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.transaction.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete transaction', error);
    }
  }

  async findByUserId(userId: number) {
    try {
      return await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find transactions by user id', error);
    }
  }

  async findByReferrerId(referId: number) {
    try {
      return await prisma.transaction.findMany({
        where: { referId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find transactions by referrer id', error);
    }
  }

  async findByType(type: TransactionType) {
    try {
      return await prisma.transaction.findMany({
        where: { type },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find transactions by type', error);
    }
  }

  async getTotalByUserId(userId: number, currency?: Currency) {
    try {
      const where: any = { userId };
      if (currency) {
        where.currency = currency;
      }

      const result = await prisma.transaction.aggregate({
        where,
        _sum: {
          amount: true,
          earned: true,
        },
      });

      return {
        totalAmount: result._sum.amount || 0,
        totalEarned: result._sum.earned || 0,
      };
    } catch (error) {
      throw new DatabaseError('Failed to get total transactions by user id', error);
    }
  }

  async getTotalByReferrerId(referId: number, currency?: Currency) {
    try {
      const where: any = { referId };
      if (currency) {
        where.currency = currency;
      }

      const result = await prisma.transaction.aggregate({
        where,
        _sum: {
          earned: true,
        },
      });

      return result._sum.earned || 0;
    } catch (error) {
      throw new DatabaseError('Failed to get total earned by referrer id', error);
    }
  }

  async createOrderTransaction(
    userId: number,
    referId: number | null,
    amount: number,
    currency: Currency,
    earned?: number
  ) {
    try {
      const data: Prisma.TransactionCreateInput = {
        user: { connect: { id: userId } },
        amount,
        currency,
        type: 'order',
        earned: earned || null,
      };

      if (referId) {
        data.referrer = { connect: { id: referId } };
      }

      return await prisma.transaction.create({
        data,
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create order transaction', error);
    }
  }

  async createRefundTransaction(userId: number, amount: number, currency: Currency) {
    try {
      return await prisma.transaction.create({
        data: {
          user: { connect: { id: userId } },
          amount,
          currency,
          type: 'refund',
        },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create refund transaction', error);
    }
  }
}

export const transactionRepository = new TransactionRepository();
