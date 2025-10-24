import { Request, Response } from 'express';
// MONGO BACKUP: import Withdrawal from '../models/Withdrawal';
// MONGO BACKUP: import User from '../models/User';
import { logger } from '../config/logger';
import * as process from "node:process";
import {CryptoPay} from "@foile/crypto-pay-api";
import axios from "axios";
import { prisma } from '../db/client';
import { withdrawalRepository, userRepository } from '../db';

export const cryptoPay = new CryptoPay(process.env.CRYPTOPAY_API_KEY!);

export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;
    const { amount } = req.body;

    const currency = 'USDT';

    // MONGO BACKUP: const user = await User.findById(userId);
    const user = await userRepository.findById(userId!);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (currency !== 'USDT') return res.status(400).json({ message: 'Incorrect currency' });
    if (amount < 1) return res.status(400).json({ message: 'Minimum withdrawal amount is 1 USDT' });
    if (user.balanceUSDT < amount) return res.status(400).json({ message: 'Insufficient USDT balance' });

    // MONGO BACKUP: const withdrawal = new Withdrawal({
    // MONGO BACKUP:   userId,
    // MONGO BACKUP:   amount,
    // MONGO BACKUP:   status: 'pending',
    // MONGO BACKUP:   currency
    // MONGO BACKUP: });
    // MONGO BACKUP: await withdrawal.save();

    const withdrawal = await withdrawalRepository.createWithdrawal(userId!, amount, currency as 'USDT');
    logger.info('Withdrawal request created', { context: { withdrawalId: withdrawal.id } });

    const spend_id = `withdraw_${Date.now()}`;

    try {
      await cryptoPay.transfer(userId!, currency, amount.toString(), spend_id);

      // MONGO BACKUP: user.balanceUSDT -= amount;
      // MONGO BACKUP: await user.save();
      await userRepository.updateBalance(userId!, 'USDT', -amount);

      // MONGO BACKUP: withdrawal.status = 'completed';
      // MONGO BACKUP: await withdrawal.save();
      await withdrawalRepository.updateStatus(withdrawal.id, 'completed');

      const botToken = process.env.BOT_TOKEN;
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      await axios.post(url, {
        chat_id: userId,
        text: `Вывод средств выполнен успешно.`,
      });

      logger.info('Withdrawal completed', { context: { withdrawalId: withdrawal.id } });
      return res.status(201).json(withdrawal);
    } catch (error: any) {
      // MONGO BACKUP: withdrawal.status = 'rejected';
      // MONGO BACKUP: await withdrawal.save();
      await withdrawalRepository.updateStatus(withdrawal.id, 'rejected');

      logger.error(`Withdrawal failed: ${error.message}`, { context: { withdrawalId: withdrawal.id } });
      return res.status(500).json({ message: 'Error during withdrawal', error: error.message });
    }
  } catch (error) {
    logger.error(`Error creating withdrawal: ${error}`);
    return res.status(500).json({ message: 'Error creating withdrawal', error });
  }
};

export const getWithdrawalsByMe = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;
    logger.info("Fetching all withdrawals by userId", { context: { userId } });
    // MONGO BACKUP: const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 });
    const withdrawals = await withdrawalRepository.findByUserId(userId!);
    logger.info("Withdrawals fetched succussfully", { context: { userId, count: withdrawals.length } });
    res.json(withdrawals);
  } catch (error) {
    logger.error(`Error getting withdrawals: ${error}`);
    res.status(500).json({ message: 'Error getting withdrawals', error });
  }
}
