import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { OrderStatus, Prisma } from '../../../generated/prisma';

export class OrderRepository {
  async findById(id: number) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          offer: { include: { game: true } },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
      if (!order) {
        throw new NotFoundError('Order', id);
      }
      return order;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find order by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.order.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          offer: { include: { game: true } },
          payment: true,
          orderDetails: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all orders', error);
    }
  }

  async create(data: Prisma.OrderCreateInput) {
    try {
      return await prisma.order.create({
        data,
        include: {
          user: true,
          offer: { include: { game: true } },
          payment: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create order', error);
    }
  }

  async update(id: number, data: Prisma.OrderUpdateInput) {
    try {
      return await prisma.order.update({
        where: { id },
        data,
        include: {
          user: true,
          offer: { include: { game: true } },
          payment: true,
          orderDetails: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update order', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.order.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete order', error);
    }
  }

  async findByUserId(userId: number) {
    try {
      return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          offer: { include: { game: true } },
          payment: true,
          orderDetails: true,
          review: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find orders by user id', error);
    }
  }

  async findByStatus(status: OrderStatus) {
    try {
      return await prisma.order.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          offer: { include: { game: true } },
          payment: true,
          orderDetails: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find orders by status', error);
    }
  }

  async updateStatus(id: number, status: OrderStatus) {
    try {
      return await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          offer: { include: { game: true } },
          payment: true,
          orderDetails: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update order status', error);
    }
  }

  async createWithDetails(
    orderData: Prisma.OrderCreateInput,
    detailsData: Omit<Prisma.OrderDetailsCreateInput, 'order'>
  ) {
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
          offer: { include: { game: true } },
          payment: true,
          orderDetails: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create order with details', error);
    }
  }

  async updateDetails(orderId: number, detailsData: Prisma.OrderDetailsUpdateInput) {
    try {
      return await prisma.orderDetails.update({
        where: { orderId },
        data: detailsData,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update order details', error);
    }
  }

  async getDetails(orderId: number) {
    try {
      return await prisma.orderDetails.findUnique({
        where: { orderId },
      });
    } catch (error) {
      throw new DatabaseError('Failed to get order details', error);
    }
  }

  async findPendingOrders() {
    try {
      return await prisma.order.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: {
          user: true,
          offer: { include: { game: true } },
          payment: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find pending orders', error);
    }
  }

  async countByStatus(status: OrderStatus) {
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
