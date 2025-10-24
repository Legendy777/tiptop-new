import { Request, Response } from 'express';
import User from '../models/User';
import { logger } from '../config/logger';
import process from "node:process";
import console from "node:console";

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

    // check user existence
    const user1 = await User.findOne({ _id: userId });
    if (user1) {
      if (user1._id === userId) {
        logger.warn(`User with id ${userId} is already exists`);
        return res.status(200).json({})
      }
    }

    const newUser = {
      _id: userId,
      username: username,
      avatarUrl: avatarUrl,
    };

    logger.info('New user data: ', { context: { user: newUser } });

    const user = new User(newUser);
    await user.save();

    logger.info('User created successfully', { context: { userId: user._id } });
    res.status(201).json(user);
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

    // check user existence
    const user1 = await User.findOne({ _id: req.body.userId });
    if (user1) {
      if (user1._id === req.body.userId) {
        logger.warn(`User with id ${req.body.userId} is already exists`);
        return res.status(200).json({})
      }
    }

    // Validate request body
    if (!req.body.avatarUrl) {
      logger.warn('Invalid request body', { context: { body: req.body } });
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const newUser = {
      _id: req.body.userId,
      username: req.body.username,
      avatarUrl: req.body.avatarUrl,
    };

    const user = new User(newUser);
    await user.save();

    logger.info('User created successfully', { context: { userId: user._id } });
    res.status(201).json(user);
  } catch (error) {
    logger.error('Error creating user', { context: { error } });
    res.status(400).json({ error: 'Error creating user', details: error });
  }
};

// Get user by ID
export const getUserByIdBot = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const token = req.get('Token');

    logger.info('Fetching user by ID', { context: { userId: userId } });

    if (token !== process.env.AUTH_BOT_TOKEN) {
      logger.warn('Invalid request token', { context: { token: token } });
      return res.status(400).json({ error: 'Invalid request token' });
    }

    const user = await User.findById(userId);

    if (!user) {
      logger.warn('User not found', { context: { userId: userId } });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User fetched successfully', { context: { userId: user._id } });
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user', { context: { error } });
    res.status(500).json({ error: 'Error fetching user' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;

    logger.info('Fetching user by ID', { context: { userId: userId } });

    const user = await User.findById(userId);

    if (!user) {
      logger.warn('User not found', { context: { userId: userId } });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User fetched successfully', { context: { userId: user._id } });
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user', { context: { error } });
    res.status(500).json({ error: 'Error fetching user' });
  }
};


export const updateLanguageBot = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const language = req.body.language;
  const token = req.get('Token');

  logger.info('Updating user language by ID', { context: { userId: userId } });

  if (token !== process.env.AUTH_BOT_TOKEN) {
    logger.warn('Invalid request token', { context: { token: token } });
    return res.status(400).json({ error: 'Invalid request token' });
  }

  const user = await User.findById(userId);

  if (!user) {
    logger.warn('User not found', { context: { userId: userId } });
    return res.status(404).json({ error: 'User not found' });
  }

  user.language = language;
  await user.save();

  logger.info('User language updated successfully', { context: { userId: user._id } });
  res.json(user);
}

export const updateSubscriptionBot = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const isSubscribed = req.body.isSubscribed;
  const token = req.get('Token');

  logger.info('Updating user subscription by ID', { context: { userId: userId } });

  if (token !== process.env.AUTH_BOT_TOKEN) {
    logger.warn('Invalid request token', { context: { token: token } });
    return res.status(400).json({ error: 'Invalid request token' });
  }

  const user = await User.findById(userId);

  if (!user) {
    logger.warn('User not found', { context: { userId: userId } });
    return res.status(404).json({ error: 'User not found' });
  }

  user.isSubscribed = isSubscribed;
  await user.save();

  logger.info('User isSubscribed updated successfully', { context: { userId: user._id } });
  res.json(user);
}

export const updateLanguage = async (req: Request, res: Response) => {
  const userId = req.telegramUser?.id;
  const language = req.body.language;

  logger.info('Updating user language by ID', { context: { userId: userId } });

  const user = await User.findById(userId);

  if (!user) {
    logger.warn('User not found', { context: { userId: userId } });
    return res.status(404).json({ error: 'User not found' });
  }

  user.language = language;
  await user.save();

  logger.info('User language updated successfully', { context: { userId: user._id } });
  res.json(user);
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
