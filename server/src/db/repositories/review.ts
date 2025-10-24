import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Prisma } from '../../../generated/prisma';

export class ReviewRepository {
  async findById(id: number) {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
      if (!review) {
        throw new NotFoundError('Review', id);
      }
      return review;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find review by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.review.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all reviews', error);
    }
  }

  async create(data: Prisma.ReviewCreateInput) {
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

  async update(id: number, data: Prisma.ReviewUpdateInput) {
    try {
      return await prisma.review.update({
        where: { id },
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

  async delete(id: number) {
    try {
      return await prisma.review.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete review', error);
    }
  }

  async findByUserId(userId: number) {
    try {
      return await prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find reviews by user id', error);
    }
  }

  async findByOrderId(orderId: number) {
    try {
      return await prisma.review.findUnique({
        where: { orderId },
        include: {
          user: true,
          order: { include: { offer: { include: { game: true } } } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find review by order id', error);
    }
  }

  async findByRating(rating: number) {
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

  async getAverageRating() {
    try {
      const result = await prisma.review.aggregate({
        _avg: { rating: true },
      });
      return result._avg.rating || 0;
    } catch (error) {
      throw new DatabaseError('Failed to get average rating', error);
    }
  }

  async countByRating(rating: number) {
    try {
      return await prisma.review.count({
        where: { rating },
      });
    } catch (error) {
      throw new DatabaseError('Failed to count reviews by rating', error);
    }
  }

  async getLatestReviews(limit: number = 10) {
    try {
      return await prisma.review.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
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
