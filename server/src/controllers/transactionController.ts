import { Request, Response } from 'express';
import Transaction from "../models/Transaction";
import User from '../models/User';

export const getTransactionsByRefer = async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser?.id;

        const transactions = await Transaction.find({ referId: Number(userId) });

        const userIds = transactions.map(tx => tx.userId);
        const users = await User.find({ _id: { $in: userIds } }).lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u.username]));

        const transactionsWithUsername = transactions.map(tx => ({
            ...tx.toObject(),
            username: userMap.get(tx.userId.toString()) || null,
        }));

        res.json(transactionsWithUsername);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch transactions for refer' });
    }
};
