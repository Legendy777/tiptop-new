import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Prisma } from '../../../generated/prisma';

export class GameRepository {
  async findById(id: number) {
    try {
      const game = await prisma.game.findUnique({
        where: { id },
        include: { offers: true },
      });
      if (!game) {
        throw new NotFoundError('Game', id);
      }
      return game;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find game by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.game.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { offers: true },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all games', error);
    }
  }

  async create(data: Prisma.GameCreateInput) {
    try {
      return await prisma.game.create({ data });
    } catch (error) {
      throw new DatabaseError('Failed to create game', error);
    }
  }

  async update(id: number, data: Prisma.GameUpdateInput) {
    try {
      return await prisma.game.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new DatabaseError('Failed to update game', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.game.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete game', error);
    }
  }

  async findEnabled() {
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

  async findActual() {
    try {
      return await prisma.game.findMany({
        where: {
          isEnabled: true,
          isActual: true,
        },
        include: { offers: { where: { isEnabled: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find actual games', error);
    }
  }

  async findWithDiscount() {
    try {
      return await prisma.game.findMany({
        where: {
          isEnabled: true,
          hasDiscount: true,
        },
        include: { offers: { where: { isEnabled: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find games with discount', error);
    }
  }

  async toggleEnabled(id: number) {
    try {
      const game = await this.findById(id);
      return await prisma.game.update({
        where: { id },
        data: { isEnabled: !game.isEnabled },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle game enabled status', error);
    }
  }

  async toggleActual(id: number) {
    try {
      const game = await this.findById(id);
      return await prisma.game.update({
        where: { id },
        data: { isActual: !game.isActual },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle game actual status', error);
    }
  }

  async toggleDiscount(id: number) {
    try {
      const game = await this.findById(id);
      return await prisma.game.update({
        where: { id },
        data: { hasDiscount: !game.hasDiscount },
      });
    } catch (error) {
      throw new DatabaseError('Failed to toggle game discount status', error);
    }
  }
}

export const gameRepository = new GameRepository();
