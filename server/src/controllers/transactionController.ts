import { Request, Response } from 'express';
// MONGO BACKUP: import Transaction from "../models/Transaction";
// MONGO BACKUP: import User from '../models/User';
import { prisma } from '../db/client';
import { transactionRepository } from '../db';

export const getTransactionsByRefer = async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser?.id;

        // MONGO BACKUP: const transactions = await Transaction.find({ referId: Number(userId) });
        const transactions = await transactionRepository.findByReferrerId(Number(userId));

        // MONGO BACKUP: const userIds = transactions.map(tx => tx.userId);
        // MONGO BACKUP: const users = await User.find({ _id: { $in: userIds } }).lean();
        // MONGO BACKUP: const userMap = new Map(users.map(u => [u._id.toString(), u.username]));
        // MONGO BACKUP: const transactionsWithUsername = transactions.map(tx => ({
        // MONGO BACKUP:     ...tx.toObject(),
        // MONGO BACKUP:     username: userMap.get(tx.userId.toString()) || null,
        // MONGO BACKUP: }));

        const transactionsWithUsername = transactions.map(tx => ({
            ...tx,
            username: tx.user?.username || null,
        }));

        res.json(transactionsWithUsername);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch transactions for refer' });
    }
};
