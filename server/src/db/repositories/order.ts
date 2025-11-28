import { prisma } from '../client';
import { Prisma } from '@prisma/client';
import { DatabaseError, NotFoundError } from '../error';

type OrderStatus = 'pending' | 'process' | 'completed' | 'canceled' | 'invalid';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    offer: {
      include: {
        game: true;
      };
    };
    payment: true;
    orderDetails: true;
    review: true;
  };
}>;

export class OrderRepository {
  async findById(id: number | string): Promise<OrderWithRelations> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
      if (!order) {
        throw new NotFoundError('Order', String(id));
      }
      return order;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find order by id', error);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<OrderWithRelations[]> {
    try {
      return await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all orders', error);
    }
  }

  async create(data: Prisma.OrderCreateInput): Promise<OrderWithRelations> {
    try {
      return await prisma.order.create({
        data,
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create order', error);
    }
  }

  async update(id: number | string, data: Prisma.OrderUpdateInput): Promise<OrderWithRelations> {
    try {
      return await prisma.order.update({
        where: { id: Number(id) },
        data,
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update order', error);
    }
  }

  async delete(id: number | string) {
    try {
      return await prisma.order.delete({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError('Failed to delete order', error);
    }
  }

  async findByUserId(userId: number | string): Promise<OrderWithRelations[]> {
    try {
      return await prisma.order.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find orders by user id', error);
    }
  }

  async findByStatus(status: OrderStatus): Promise<OrderWithRelations[]> {
    try {
      return await prisma.order.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find orders by status', error);
    }
  }

  async updateStatus(id: number | string, status: OrderStatus): Promise<OrderWithRelations> {
    try {
      return await prisma.order.update({
        where: { id: Number(id) },
        data: { status },
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update order status', error);
    }
  }

  async createWithDetails(orderData: Prisma.OrderCreateInput, detailsData: Prisma.OrderDetailsCreateInput): Promise<OrderWithRelations> {
    try {
      return await prisma.order.create({
        data: {
        ...orderData,
          orderDetails: {
            create: detailsData,
          },
        },
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create order with details', error);
    }
  }

  async updateDetails(orderId: number | string, detailsData: Prisma.OrderDetailsUpdateInput) {
    try {
      const order = await this.findById(orderId);
      if (!order.orderDetails) {
        // Create if doesn't exist
        return await prisma.orderDetails.create({
          data: {
            order: { connect: { id: order.id } },
            ...detailsData as any,
          },
        });
      }
      return await prisma.orderDetails.update({
        where: { orderId: order.id },
        data: detailsData,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update order details', error);
    }
  }

  async getDetails(orderId: number | string) {
    try {
      const order = await this.findById(orderId);
      if (!order.orderDetails) {
        throw new NotFoundError('OrderDetails', String(orderId));
      }
      return await prisma.orderDetails.findUnique({
        where: { orderId: order.id },
      });
    } catch (error) {
      throw new DatabaseError('Failed to get order details', error);
    }
  }

  async findPendingOrders(): Promise<OrderWithRelations[]> {
    try {
      return await prisma.order.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: {
          user: true,
          offer: {
            include: {
              game: true,
            },
          },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find pending orders', error);
    }
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    try {
      return await prisma.order.count({
        where: { status },
      });
    } catch (error) {
      throw new DatabaseError('Failed to count orders by status', error);
    }
  }
}

export const orderRepository = new OrderRepository();
