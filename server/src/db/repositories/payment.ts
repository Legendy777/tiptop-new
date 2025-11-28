import { prisma } from '../client';
import { Prisma, PaymentStatus, Currency } from '@prisma/client';
import { DatabaseError, NotFoundError } from '../error';

type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    order: true;
    offer: {
      include: {
        game: true;
      };
    };
  };
}>;

export class PaymentRepository {
  async findById(id: number | string): Promise<PaymentWithRelations> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
      if (!payment) {
        throw new NotFoundError('Payment', String(id));
      }
      return payment;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find payment by id', error);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<PaymentWithRelations[]> {
    try {
      return await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all payments', error);
    }
  }

  async create(data: Prisma.PaymentCreateInput): Promise<PaymentWithRelations> {
    try {
      return await prisma.payment.create({
        data,
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create payment', error);
    }
  }

  async update(id: number | string, data: Prisma.PaymentUpdateInput): Promise<PaymentWithRelations> {
    try {
      return await prisma.payment.update({
        where: { id: Number(id) },
        data,
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update payment', error);
    }
  }

  async delete(id: number | string) {
    try {
      return await prisma.payment.delete({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError('Failed to delete payment', error);
    }
  }

  async findByExternalId(externalId: string): Promise<PaymentWithRelations | null> {
    try {
      return await prisma.payment.findUnique({
        where: { externalId },
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find payment by external id', error);
    }
  }

  async findByUserId(userId: number | string): Promise<PaymentWithRelations[]> {
    try {
      return await prisma.payment.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find payments by user id', error);
    }
  }

  async findByStatus(status: PaymentStatus): Promise<PaymentWithRelations[]> {
    try {
      return await prisma.payment.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find payments by status', error);
    }
  }

  async updateStatus(id: number | string, status: PaymentStatus): Promise<PaymentWithRelations> {
    try {
      return await prisma.payment.update({
        where: { id: Number(id) },
        data: { status },
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update payment status', error);
    }
  }

  async updateStatusByExternalId(externalId: string, status: PaymentStatus): Promise<PaymentWithRelations> {
    try {
      return await prisma.payment.update({
        where: { externalId },
        data: { status },
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update payment status by external id', error);
    }
  }

  async findPendingPayments(): Promise<PaymentWithRelations[]> {
    try {
      return await prisma.payment.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: {
          user: true,
          order: true,
          offer: {
            include: {
              game: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find pending payments', error);
    }
  }

  async countByStatus(status: PaymentStatus): Promise<number> {
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
