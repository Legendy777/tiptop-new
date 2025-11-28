import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Prisma } from '@prisma/client';

type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    user: true;
    order: {
      include: {
        offer: { include: { game: true } };
      };
    };
  };
}>;

export class ReviewRepository {
  async findById(id: number | string): Promise<ReviewWithRelations> {
    try {
      const review = await prisma.review.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
      if (!review) {
        throw new NotFoundError('Review', String(id));
      }
      return review;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find review by id', error);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<ReviewWithRelations[]> {
    try {
      return await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all reviews', error);
    }
  }

  async create(data: Prisma.ReviewCreateInput): Promise<ReviewWithRelations> {
    try {
      return await prisma.review.create({
        data,
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create review', error);
    }
  }

  async update(id: number | string, data: Prisma.ReviewUpdateInput): Promise<ReviewWithRelations> {
    try {
      return await prisma.review.update({
        where: { id: Number(id) },
        data,
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update review', error);
    }
  }

  async delete(id: number | string) {
    try {
      return await prisma.review.delete({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError('Failed to delete review', error);
    }
  }

  async findByUserId(userId: number | string): Promise<ReviewWithRelations[]> {
    try {
      return await prisma.review.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find reviews by user id', error);
    }
  }

  async findByOrderId(orderId: number | string): Promise<ReviewWithRelations | null> {
    try {
      return await prisma.review.findUnique({
        where: { orderId: Number(orderId) },
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find review by order id', error);
    }
  }

  async findByRating(rating: number): Promise<ReviewWithRelations[]> {
    try {
      return await prisma.review.findMany({
        where: { rating },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find reviews by rating', error);
    }
  }

  async getAverageRating(): Promise<number> {
    try {
      const aggregate = await prisma.review.aggregate({
        _avg: { rating: true },
      });
      return aggregate._avg.rating || 0;
    } catch (error) {
      throw new DatabaseError('Failed to get average rating', error);
    }
  }

  async countByRating(rating: number): Promise<number> {
    try {
      return await prisma.review.count({
        where: { rating },
      });
    } catch (error) {
      throw new DatabaseError('Failed to count reviews by rating', error);
    }
  }

  async getLatestReviews(limit: number = 10): Promise<ReviewWithRelations[]> {
    try {
      return await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to get latest reviews', error);
    }
  }
}

export const reviewRepository = new ReviewRepository();
