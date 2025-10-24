import { Request, Response } from 'express';
// MONGO BACKUP: import Referral from '../models/Referral';
import { logger } from '../config/logger';
// MONGO BACKUP: import User from '../models/User';
import { prisma } from '../db/client';
import { referralRepository } from '../db';

// create new referral by refer via bot
export const createReferralByRefer = async (req: Request, res: Response) => {
  try {
    logger.info('Creating a new referral', { context: { body: req.body } });

    const token = req.get('Token');
    if (token !== process.env.AUTH_BOT_TOKEN) {
      logger.warn('Invalid request token', { context: { token: token } });
      return res.status(400).json({ error: 'Invalid request token' });
    }

    // Validate telegram data
    if (!req.body.userId || !req.body.referId) {
      logger.warn('Invalid request body', { context: { body: req.body } });
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // MONGO BACKUP: const user = await User.findOne({ _id: req.body.userId });
    const user = await prisma.user.findUnique({ where: { id: req.body.userId } });
    if (user) {
      if (user.id === req.body.userId) {
        logger.warn(`User with id ${req.body.userId} is already exists`);
        return res.status(409).json({})
      }
    }

    // MONGO BACKUP: const newReferral = {
    // MONGO BACKUP:   userId: req.body.userId,
    // MONGO BACKUP:   referId: req.body.referId
    // MONGO BACKUP: };
    // MONGO BACKUP: const referral = new Referral(newReferral);
    // MONGO BACKUP: await referral.save();

    const referral = await referralRepository.createReferral(req.body.userId, req.body.referId);

    logger.info('Referral created successfully', { context: { userId: referral.userId } });
    res.status(201).json(referral);
  } catch (error) {
    logger.error('Error creating referral', { context: { error } });
    res.status(500).json({ error: 'Error creating referral', details: error });
  }
}

// Get referral count by refer
export const getReferralCountByReferId = async (req: Request, res: Response) => {
  try {
    const referId = req.telegramUser?.id;
    // MONGO BACKUP: const count = await Referral.countDocuments({ referId });
    const count = await referralRepository.countByReferrerId(referId!);
    logger.info('Referral count fetched successfully', { context: { referId, count } });
    res.json(count); // Return as a plain number
  } catch (error) {
    logger.error('Error fetching referral count', { context: { error } });
    res.status(500).json({ message: 'Error fetching referral count', error });
  }
};
