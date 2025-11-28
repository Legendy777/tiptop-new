import { prisma } from '../client';
import { Prisma } from '@prisma/client';
import { DatabaseError, NotFoundError } from '../error';

type OfferWithGame = Prisma.OfferGetPayload<{
  include: {
    game: true;
  };
}>;

export class OfferRepository {
  async findById(id: number | string): Promise<OfferWithGame> {
    try {
      const offer = await prisma.offer.findUnique({
        where: { id: Number(id) },
        include: {
          game: true,
        },
      });
      if (!offer) {
        throw new NotFoundError('Offer', String(id));
      }
      return offer;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find offer by id', error);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<OfferWithGame[]> {
    try {
      return await prisma.offer.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          game: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all offers', error);
    }
  }

  async create(data: Prisma.OfferCreateInput): Promise<OfferWithGame> {
    try {
      return await prisma.offer.create({
        data,
        include: {
          game: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create offer', error);
    }
  }

  async update(id: number | string, data: Prisma.OfferUpdateInput): Promise<OfferWithGame> {
    try {
      return await prisma.offer.update({
        where: { id: Number(id) },
        data,
        include: {
          game: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update offer', error);
    }
  }

  async delete(id: number | string) {
    try {
      return await prisma.offer.delete({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError('Failed to delete offer', error);
    }
  }

  async findByGameId(gameId: number | string): Promise<OfferWithGame[]> {
    try {
      return await prisma.offer.findMany({
        where: { gameId: Number(gameId) },
        include: {
          game: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find offers by game id', error);
    }
  }

  async findEnabled(): Promise<OfferWithGame[]> {
    try {
      return await prisma.offer.findMany({
        where: { isEnabled: true },
        include: {
          game: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find enabled offers', error);
    }
  }

  async findEnabledByGameId(gameId: number | string): Promise<OfferWithGame[]> {
    try {
      return await prisma.offer.findMany({
        where: { gameId: Number(gameId), isEnabled: true },
        include: {
          game: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find enabled offers by game id', error);
    }
  }

  async toggleEnabled(id: number | string): Promise<OfferWithGame> {
    try {
      const offer = await this.findById(id);
      return await prisma.offer.update({
        where: { id: Number(id) },
        data: { isEnabled: !offer.isEnabled },
        include: {
          game: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle offer enabled status', error);
    }
  }

  async updatePrices(id: number | string, priceRUB: number, priceUSDT: number): Promise<OfferWithGame> {
    try {
      return await prisma.offer.update({
        where: { id: Number(id) },
        data: { 
          priceRUB,
          priceUSDT,
        },
        include: {
          game: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update offer prices', error);
    }
  }
}

export const offerRepository = new OfferRepository();
