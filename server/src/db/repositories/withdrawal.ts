import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { WithdrawalStatus, Currency, Prisma } from '@prisma/client';

export class WithdrawalRepository {
  async findById(id: number) {
    try {
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });
      if (!withdrawal) {
        throw new NotFoundError('Withdrawal', id);
      }
      return withdrawal;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find withdrawal by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.withdrawal.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all withdrawals', error);
    }
  }

  async create(data: Prisma.WithdrawalCreateInput) {
    try {
      return await prisma.withdrawal.create({
        data,
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create withdrawal', error);
    }
  }

  async update(id: number, data: Prisma.WithdrawalUpdateInput) {
    try {
      return await prisma.withdrawal.update({
        where: { id },
        data,
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update withdrawal', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.withdrawal.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete withdrawal', error);
    }
  }

  async findByUserId(userId: number) {
    try {
      return await prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find withdrawals by user id', error);
    }
  }

  async findByStatus(status: WithdrawalStatus) {
    try {
      return await prisma.withdrawal.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find withdrawals by status', error);
    }
  }

  async updateStatus(id: number, status: WithdrawalStatus) {
    try {
      return await prisma.withdrawal.update({
        where: { id },
        data: { status },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update withdrawal status', error);
    }
  }

  async findPendingWithdrawals() {
    try {
      return await prisma.withdrawal.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find pending withdrawals', error);
    }
  }

  async getTotalByUserId(userId: number, status?: WithdrawalStatus, currency?: Currency) {
    try {
      const where: any = { userId };
      if (status) {
        where.status = status;
      }
      if (currency) {
        where.currency = currency;
      }

      const result = await prisma.withdrawal.aggregate({
        where,
        _sum: {
          amount: true,
        },
      });

      return result._sum.amount || 0;
    } catch (error) {
      throw new DatabaseError('Failed to get total withdrawals by user id', error);
    }
  }

  async countByStatus(status: WithdrawalStatus) {
    try {
      return await prisma.withdrawal.count({
        where: { status },
      });
    } catch (error) {
      throw new DatabaseError('Failed to count withdrawals by status', error);
    }
  }

  async createWithdrawal(userId: number, amount: number, currency: Currency) {
    try {
      return await prisma.withdrawal.create({
        data: {
          user: { connect: { id: userId } },
          amount,
          currency,
          status: 'pending',
        },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create withdrawal request', error);
    }
  }

  async approveWithdrawal(id: number) {
    try {
      return await this.updateStatus(id, 'completed');
    } catch (error) {
      throw new DatabaseError('Failed to approve withdrawal', error);
    }
  }

  async rejectWithdrawal(id: number) {
    try {
      return await this.updateStatus(id, 'rejected');
    } catch (error) {
      throw new DatabaseError('Failed to reject withdrawal', error);
    }
  }
}

export const withdrawalRepository = new WithdrawalRepository();
