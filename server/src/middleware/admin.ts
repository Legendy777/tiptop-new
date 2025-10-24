import {NextFunction, Request, Response} from "express";
import console from "node:console";
import User, {IUser} from "../models/User";
import {logger} from "../config/logger";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.telegramUser?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Missing userId' });
        }

        const user: any = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid user data' });
        }

        if (!user.isAdmin) {
            return res.status(401).json({ message: 'User is not admin' });
        }

        next();
    } catch (error) {
        logger.error('Admin middleware error:', error);
        res.status(401).json({ message: 'Admin middleware failed' });
    }
};