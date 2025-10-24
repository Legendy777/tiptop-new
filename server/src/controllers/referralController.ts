import { Request, Response } from 'express';
import Referral from '../models/Referral';
import { logger } from '../config/logger';
import User from '../models/User';

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

    // check user existence
    const user = await User.findOne({ _id: req.body.userId });
    if (user) {
      if (user._id === req.body.userId) {
        logger.warn(`User with id ${req.body.userId} is already exists`);
        return res.status(409).json({})
      }
    }

    const newReferral = {
      userId: req.body.userId,
      referId: req.body.referId
    };

    const referral = new Referral(newReferral);
    await referral.save();

    logger.info('Referral created successfully', { context: { userId: newReferral.userId } });
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
    const count = await Referral.countDocuments({ referId });
    logger.info('Referral count fetched successfully', { context: { referId, count } });
    res.json(count); // Return as a plain number
  } catch (error) {
    logger.error('Error fetching referral count', { context: { error } });
    res.status(500).json({ message: 'Error fetching referral count', error });
  }
};