import { prisma } from '../client';
import { Prisma } from '@prisma/client';
import { DatabaseError, NotFoundError } from '../error';

type GameWithOffers = Prisma.GameGetPayload<{
  include: { offers: true };
}>;

export class GameRepository {
  async findById(id: number): Promise<GameWithOffers> {
    try {
      const game = await prisma.game.findUnique({
        where: { id },
        include: { offers: true },
      });
      if (!game) {
        throw new NotFoundError('Game', String(id));
      }
      return game;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find game by id', error);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<GameWithOffers[]> {
    try {
      return await prisma.game.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { offers: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all games', error);
    }
  }

  async create(data: Prisma.GameCreateInput): Promise<GameWithOffers> {
    try {
      return await prisma.game.create({
        data,
        include: { offers: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create game', error);
    }
  }

  async update(id: number, data: Prisma.GameUpdateInput): Promise<GameWithOffers> {
    try {
      return await prisma.game.update({
        where: { id },
        data,
        include: { offers: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update game', error);
    }
  }

  async delete(id: number): Promise<Prisma.GameGetPayload<{}>> {
    try {
      return await prisma.game.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete game', error);
    }
  }

  async findEnabled(): Promise<GameWithOffers[]> {
    try {
      return await prisma.game.findMany({
        where: { isEnabled: true },
        include: { offers: { where: { isEnabled: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find enabled games', error);
    }
  }

  async findActual(): Promise<GameWithOffers[]> {
    try {
      return await prisma.game.findMany({
        where: { isEnabled: true, isActual: true },
        include: { offers: { where: { isEnabled: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find actual games', error);
    }
  }

  async findWithDiscount(): Promise<GameWithOffers[]> {
    try {
      return await prisma.game.findMany({
        where: { isEnabled: true, hasDiscount: true },
        include: { offers: { where: { isEnabled: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find games with discount', error);
    }
  }

  async toggleEnabled(id: number): Promise<GameWithOffers> {
    try {
      const game = await this.findById(id);
      return await prisma.game.update({
        where: { id },
        data: { isEnabled: !game.isEnabled },
        include: { offers: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle game enabled status', error);
    }
  }

  async toggleActual(id: number): Promise<GameWithOffers> {
    try {
      const game = await this.findById(id);
      return await prisma.game.update({
        where: { id },
        data: { isActual: !game.isActual },
        include: { offers: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle game actual status', error);
    }
  }

  async toggleDiscount(id: number): Promise<GameWithOffers> {
    try {
      const game = await this.findById(id);
      return await prisma.game.update({
        where: { id },
        data: { hasDiscount: !game.hasDiscount },
        include: { offers: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle game discount status', error);
    }
  }
}

export const gameRepository = new GameRepository();
