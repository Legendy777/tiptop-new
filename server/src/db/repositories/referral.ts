import { prisma } from '../client';
import { Prisma } from '@prisma/client';
import { DatabaseError, NotFoundError } from '../error';

type ReferralWithRelations = Prisma.ReferralGetPayload<{
  include: {
    user: true;
    referrer: true;
  };
}>;

export class ReferralRepository {
  async findById(id: number | string): Promise<ReferralWithRelations> {
    try {
      const referral = await prisma.referral.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          referrer: true,
        },
      });
      if (!referral) {
        throw new NotFoundError('Referral', String(id));
      }
      return referral;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find referral by id', error);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<ReferralWithRelations[]> {
    try {
      return await prisma.referral.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all referrals', error);
    }
  }

  async create(data: Prisma.ReferralCreateInput): Promise<ReferralWithRelations> {
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

  async update(id: number | string, data: Prisma.ReferralUpdateInput): Promise<ReferralWithRelations> {
    try {
      return await prisma.referral.update({
        where: { id: Number(id) },
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

  async delete(id: number | string) {
    try {
      return await prisma.referral.delete({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError('Failed to delete referral', error);
    }
  }

  async findByUserId(userId: number | string): Promise<ReferralWithRelations | null> {
    try {
      return await prisma.referral.findUnique({
        where: { userId: Number(userId) },
        include: {
          user: true,
          referrer: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find referral by user id', error);
    }
  }

  async findByReferrerId(referId: number | string): Promise<ReferralWithRelations[]> {
    try {
      return await prisma.referral.findMany({
        where: { referId: Number(referId) },
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

  async countByReferrerId(referId: number | string): Promise<number> {
    try {
      return await prisma.referral.count({
        where: { referId: Number(referId) },
      });
    } catch (error) {
      throw new DatabaseError('Failed to count referrals by referrer id', error);
    }
  }

  async getReferrerByUserId(userId: number | string) {
    try {
      const referral = await this.findByUserId(userId);
      return referral?.referrer || null;
    } catch (error) {
      throw new DatabaseError('Failed to get referrer by user id', error);
    }
  }

  async createReferral(userId: number | string, referId: number | string): Promise<ReferralWithRelations> {
    try {
      return await prisma.referral.create({
        data: {
          user: { connect: { id: Number(userId) } },
          referrer: { connect: { id: Number(referId) } },
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
