import { Request, Response } from 'express';
// MONGO BACKUP: import User from '../models/User';
import { logger } from '../config/logger';
import process from "node:process";
import console from "node:console";
import { prisma } from '../db/client';
import { userRepository } from '../db';

// Helper function to serialize user with BigInt conversion
function serializeUser(user: any) {
  return {
    ...user,
    telegramId: user.telegramId?.toString(),
  };
}

// -> User

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    if (!req.telegramUser) {
      logger.warn('Missing telegramUser in request');
      return res.status(400).json({ error: 'Missing telegramUser in request' });
    }
    
    const userId = req.telegramUser?.id;
    const username = req.telegramUser?.first_name;
    const avatarUrl = req.telegramUser?.photo_url;

    logger.info('Creating a new user', { context: { userId: userId } });

    // Validate telegram data
    if (!userId || !username) {
      logger.warn('Invalid request tg data', { context: { telegramUser: req.telegramUser } });
      return res.status(400).json({ error: 'Invalid request tg data' });
    }

    // MONGO BACKUP: const user1 = await User.findOne({ _id: userId });
    const user1 = await userRepository.findByTelegramId(BigInt(userId));
    if (user1) {
      logger.warn(`User with telegramId ${userId} already exists`);
      return res.status(200).json(user1);
    }

    // MONGO BACKUP: const newUser = {
    // MONGO BACKUP:   _id: userId,
    // MONGO BACKUP:   username: username,
    // MONGO BACKUP:   avatarUrl: avatarUrl,
    // MONGO BACKUP: };
    // MONGO BACKUP: logger.info('New user data: ', { context: { user: newUser } });
    // MONGO BACKUP: const user = new User(newUser);
    // MONGO BACKUP: await user.save();

    const user = await userRepository.create({
      telegramId: BigInt(userId),
      username: username,
      avatarUrl: avatarUrl || '',
    });

    logger.info('User created successfully', { context: { userId: user.id, telegramId: user.telegramId.toString() } });
    res.status(201).json(serializeUser(user));
  } catch (error) {
    logger.error('Error creating user', { context: { error } });
    res.status(400).json({ error: 'Error creating user', details: error });
  }
};

export const createUserBot = async (req: Request, res: Response) => {
  try {
    logger.info('Creating a new user', { context: { body: req.body } });

    const token = req.get('Token');
    if (token !== process.env.AUTH_BOT_TOKEN) {
      logger.warn('Invalid request token', { context: { token: token } });
      return res.status(400).json({ error: 'Invalid request token' });
    }

    // Validate telegram data
    if (!req.body.userId || !req.body.username) {
      logger.warn('Invalid request body', { context: { body: req.body } });
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // MONGO BACKUP: const user1 = await User.findOne({ _id: req.body.userId });
    const user1 = await userRepository.findByTelegramId(BigInt(req.body.userId));
    if (user1) {
      logger.warn(`User with telegramId ${req.body.userId} already exists`);
      return res.status(200).json(user1);
    }

    // Validate request body
    if (!req.body.avatarUrl) {
      logger.warn('Invalid request body', { context: { body: req.body } });
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // MONGO BACKUP: const newUser = {
    // MONGO BACKUP:   _id: req.body.userId,
    // MONGO BACKUP:   username: req.body.username,
    // MONGO BACKUP:   avatarUrl: req.body.avatarUrl,
    // MONGO BACKUP: };
    // MONGO BACKUP: const user = new User(newUser);
    // MONGO BACKUP: await user.save();

    const userData = {
      telegramId: BigInt(req.body.userId),
      username: req.body.username,
      avatarUrl: req.body.avatarUrl,
    };
    
    const user = await userRepository.create(userData);

    logger.info('User created successfully', { context: { userId: user.id, telegramId: user.telegramId.toString() } });
    res.status(201).json(serializeUser(user));
  } catch (error) {
    console.error('DETAILED ERROR creating user:', error);
    logger.error('Error creating user', { context: { error } });
    res.status(400).json({ error: 'Error creating user', details: String(error) });
  }
};

// Get user by ID
export const getUserByIdBot = async (req: Request, res: Response) => {
  try {
    const telegramId = req.params.userId;
    const token = req.get('Token');

    logger.info('Fetching user by Telegram ID', { context: { telegramId: telegramId } });

    if (token !== process.env.AUTH_BOT_TOKEN) {
      logger.warn('Invalid request token', { context: { token: token } });
      return res.status(400).json({ error: 'Invalid request token' });
    }

    // MONGO BACKUP: const user = await User.findById(userId);
    const user = await userRepository.findByTelegramId(BigInt(telegramId));

    if (!user) {
      logger.warn('User not found', { context: { telegramId: telegramId } });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User fetched successfully', { context: { userId: user.id, telegramId: user.telegramId.toString() } });
    res.json(serializeUser(user));
  } catch (error) {
    logger.error('Error fetching user', { context: { error } });
    res.status(500).json({ error: 'Error fetching user' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;

    logger.info('Fetching user by ID', { context: { userId: userId } });

    // MONGO BACKUP: const user = await User.findById(userId);
    const user = await userRepository.findById(userId!);

    if (!user) {
      logger.warn('User not found', { context: { userId: userId } });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User fetched successfully', { context: { userId: user.id, telegramId: user.telegramId.toString() } });
    res.json(serializeUser(user));
  } catch (error) {
    logger.error('Error fetching user', { context: { error } });
    res.status(500).json({ error: 'Error fetching user' });
  }
};


export const updateLanguageBot = async (req: Request, res: Response) => {
  const telegramId = req.params.userId;
  const language = req.body.language;
  const token = req.get('Token');

  logger.info('Updating user language by Telegram ID', { context: { telegramId: telegramId } });

  if (token !== process.env.AUTH_BOT_TOKEN) {
    logger.warn('Invalid request token', { context: { token: token } });
    return res.status(400).json({ error: 'Invalid request token' });
  }

  // MONGO BACKUP: const user = await User.findById(userId);
  const user = await userRepository.findByTelegramId(BigInt(telegramId));

  if (!user) {
    logger.warn('User not found', { context: { telegramId: telegramId } });
    return res.status(404).json({ error: 'User not found' });
  }

  // MONGO BACKUP: user.language = language;
  // MONGO BACKUP: await user.save();
  const updatedUser = await userRepository.update(user.id, { language });

  logger.info('User language updated successfully', { context: { userId: updatedUser.id, telegramId: updatedUser.telegramId.toString() } });
  res.json(serializeUser(updatedUser));
}

export const updateSubscriptionBot = async (req: Request, res: Response) => {
  const telegramId = req.params.userId;
  const isSubscribed = req.body.isSubscribed;
  const token = req.get('Token');

  logger.info('Updating user subscription by Telegram ID', { context: { telegramId: telegramId } });

  if (token !== process.env.AUTH_BOT_TOKEN) {
    logger.warn('Invalid request token', { context: { token: token } });
    return res.status(400).json({ error: 'Invalid request token' });
  }

  // MONGO BACKUP: const user = await User.findById(userId);
  const user = await userRepository.findByTelegramId(BigInt(telegramId));

  if (!user) {
    logger.warn('User not found', { context: { telegramId: telegramId } });
    return res.status(404).json({ error: 'User not found' });
  }

  // MONGO BACKUP: user.isSubscribed = isSubscribed;
  // MONGO BACKUP: await user.save();
  const updatedUser = await userRepository.updateSubscriptionStatus(user.id, isSubscribed);

  logger.info('User isSubscribed updated successfully', { context: { userId: updatedUser.id, telegramId: updatedUser.telegramId.toString() } });
  res.json(serializeUser(updatedUser));
}

export const updateLanguage = async (req: Request, res: Response) => {
  const userId = req.telegramUser?.id;
  const language = req.body.language;

  logger.info('Updating user language by ID', { context: { userId: userId } });

  // MONGO BACKUP: const user = await User.findById(userId);
  const user = await userRepository.findById(userId!);

  if (!user) {
    logger.warn('User not found', { context: { userId: userId } });
    return res.status(404).json({ error: 'User not found' });
  }

  // MONGO BACKUP: user.language = language;
  // MONGO BACKUP: await user.save();
  const updatedUser = await userRepository.update(userId!, { language });

  logger.info('User language updated successfully', { context: { userId: updatedUser.id, telegramId: updatedUser.telegramId.toString() } });
  res.json(serializeUser(updatedUser));
}

// -> Admin

// Get all users
// export const getUsers = async (req: Request, res: Response) => {
//   try {
//     logger.info('Fetching all users');
//     const users = await User.find();
//     logger.info('Users fetched successfully', { context: { count: users.length } });
//     res.json(users);
//   } catch (error) {
//     logger.error('Error fetching users', { context: { error } });
//     res.status(500).json({ error: 'Error fetching users' });
//   }
// };
//
// // Delete user
// export const deleteUser = async (req: Request, res: Response) => {
//   try {
//     logger.info('Deleting user', { context: { userId: req.params.id } });
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       logger.warn('User not found for deletion', { context: { userId: req.params.id } });
//       return res.status(404).json({ error: 'User not found' });
//     }
//     logger.info('User deleted successfully', { context: { userId: user._id } });
//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     logger.error('Error deleting user', { context: { error } });
//     res.status(500).json({ error: 'Error deleting user' });
//   }
// };
