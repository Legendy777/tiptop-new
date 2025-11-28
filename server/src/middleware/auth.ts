import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import dotenv from 'dotenv';
import console from "node:console";
import * as process from "node:process";
import * as path from "node:path";
import { isValid } from '@telegram-apps/init-data-node';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN || '';
if (!TELEGRAM_BOT_TOKEN) {
  logger.error('BOT_TOKEN is not defined in the environment variables');
  // Do not crash the server; authentication middleware below will handle validation based on NODE_ENV
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    telegramUser?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
  }
}

function parseInitData(initData: string): TelegramUser | null {
  const parsed = new URLSearchParams(initData);
  const userJson = parsed.get('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const initData = req.headers['x-telegram-initdata'] as string;
    
    logger.info('Authentication request received', { context: { initData } });

    if (!initData) {
      logger.error('Missing initData: ', initData);
      return res.status(401).json({ message: 'Missing initData' });
    }

    if (process.env.NODE_ENV === 'production') {
      if (!isValid(initData, TELEGRAM_BOT_TOKEN)) {
        logger.error('Invalid initData: ', initData);
        return res.status(401).json({ message: 'Invalid initData' });
      }
    }

    const user = parseInitData(initData);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user data' });
    }

    logger.info('Authentication successful', { context: { userId: user.id } });

    req.telegramUser = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
