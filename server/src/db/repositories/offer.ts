import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Prisma } from '../../../generated/prisma';

export class OfferRepository {
  async findById(id: number) {
    try {
      const offer = await prisma.offer.findUnique({
        where: { id },
        include: { game: true },
      });
      if (!offer) {
        throw new NotFoundError('Offer', id);
      }
      return offer;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find offer by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.offer.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { game: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all offers', error);
    }
  }

  async create(data: Prisma.OfferCreateInput) {
    try {
      return await prisma.offer.create({ data });
    } catch (error) {
      throw new DatabaseError('Failed to create offer', error);
    }
  }

  async update(id: number, data: Prisma.OfferUpdateInput) {
    try {
      return await prisma.offer.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update offer', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.offer.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete offer', error);
    }
  }

  async findByGameId(gameId: number) {
    try {
      return await prisma.offer.findMany({
        where: { gameId },
        include: { game: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find offers by game id', error);
    }
  }

  async findEnabled() {
    try {
      return await prisma.offer.findMany({
        where: { isEnabled: true },
        include: { game: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find enabled offers', error);
    }
  }

  async findEnabledByGameId(gameId: number) {
    try {
      return await prisma.offer.findMany({
        where: {
          gameId,
          isEnabled: true,
        },
        include: { game: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find enabled offers by game id', error);
    }
  }

  async toggleEnabled(id: number) {
    try {
      const offer = await this.findById(id);
      return await prisma.offer.update({
        where: { id },
        data: { isEnabled: !offer.isEnabled },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle offer enabled status', error);
    }
  }

  async updatePrices(id: number, priceRUB: number, priceUSDT: number) {
    try {
      return await prisma.offer.update({
        where: { id },
        data: {
          priceRUB,
          priceUSDT,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update offer prices', error);
    }
  }
}

export const offerRepository = new OfferRepository();
