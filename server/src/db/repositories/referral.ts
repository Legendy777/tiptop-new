import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Prisma } from '../../../generated/prisma';

export class ReferralRepository {
  async findById(id: number) {
    try {
      const referral = await prisma.referral.findUnique({
        where: { id },
        include: {
          user: true,
          referrer: true,
        },
      });
      if (!referral) {
        throw new NotFoundError('Referral', id);
      }
      return referral;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find referral by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.referral.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all referrals', error);
    }
  }

  async create(data: Prisma.ReferralCreateInput) {
    try {
      return await prisma.referral.create({
        data,
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create referral', error);
    }
  }

  async update(id: number, data: Prisma.ReferralUpdateInput) {
    try {
      return await prisma.referral.update({
        where: { id },
        data,
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update referral', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.referral.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete referral', error);
    }
  }

  async findByUserId(userId: number) {
    try {
      return await prisma.referral.findUnique({
        where: { userId },
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find referral by user id', error);
    }
  }

  async findByReferrerId(referId: number) {
    try {
      return await prisma.referral.findMany({
        where: { referId },
        include: {
          user: true,
          referrer: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find referrals by referrer id', error);
    }
  }

  async countByReferrerId(referId: number) {
    try {
      return await prisma.referral.count({
        where: { referId },
      });
    } catch (error) {
      throw new DatabaseError('Failed to count referrals by referrer id', error);
    }
  }

  async getReferrerByUserId(userId: number) {
    try {
      const referral = await prisma.referral.findUnique({
        where: { userId },
        include: {
          referrer: true,
        },
      });
      return referral?.referrer || null;
    } catch (error) {
      throw new DatabaseError('Failed to get referrer by user id', error);
    }
  }

  async createReferral(userId: number, referId: number) {
    try {
      return await prisma.referral.create({
        data: {
          user: { connect: { id: userId } },
          referrer: { connect: { id: referId } },
        },
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create referral relationship', error);
    }
  }
}

export const referralRepository = new ReferralRepository();
