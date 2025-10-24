import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { PaymentStatus, Prisma } from '../../../generated/prisma';

export class PaymentRepository {
  async findById(id: number) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          user: true,
          order: true,
          offer: { include: { game: true } },
        },
      });
      if (!payment) {
        throw new NotFoundError('Payment', id);
      }
      return payment;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find payment by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.payment.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          order: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all payments', error);
    }
  }

  async create(data: Prisma.PaymentCreateInput) {
    try {
      return await prisma.payment.create({
        data,
        include: {
          user: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create payment', error);
    }
  }

  async update(id: number, data: Prisma.PaymentUpdateInput) {
    try {
      return await prisma.payment.update({
        where: { id },
        data,
        include: {
          user: true,
          order: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update payment', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.payment.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete payment', error);
    }
  }

  async findByExternalId(externalId: string) {
    try {
      return await prisma.payment.findUnique({
        where: { externalId },
        include: {
          user: true,
          order: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find payment by external id', error);
    }
  }

  async findByUserId(userId: number) {
    try {
      return await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          order: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find payments by user id', error);
    }
  }

  async findByStatus(status: PaymentStatus) {
    try {
      return await prisma.payment.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          order: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find payments by status', error);
    }
  }

  async updateStatus(id: number, status: PaymentStatus) {
    try {
      return await prisma.payment.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          order: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update payment status', error);
    }
  }

  async updateStatusByExternalId(externalId: string, status: PaymentStatus) {
    try {
      return await prisma.payment.update({
        where: { externalId },
        data: { status },
        include: {
          user: true,
          order: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update payment status by external id', error);
    }
  }

  async findPendingPayments() {
    try {
      return await prisma.payment.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: {
          user: true,
          offer: { include: { game: true } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find pending payments', error);
    }
  }

  async countByStatus(status: PaymentStatus) {
    try {
      return await prisma.payment.count({
        where: { status },
      });
    } catch (error) {
      throw new DatabaseError('Failed to count payments by status', error);
    }
  }
}

export const paymentRepository = new PaymentRepository();
