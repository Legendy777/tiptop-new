import {NextFunction, Request, Response} from "express";
import console from "node:console";
import { userRepository } from '../db';
import {logger} from "../config/logger";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.telegramUser?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Missing userId' });
        }

        const user = await userRepository.findByTelegramId(userId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid user data' });
        }

        // Check if user ID matches ADMIN_ID
        if (user.id !== Number(process.env.ADMIN_ID)) {
            return res.status(403).json({ message: 'User is not admin' });
        }

        next();
    } catch (error) {
        logger.error('Admin middleware error:', error);
        res.status(401).json({ message: 'Admin middleware failed' });
    }
};