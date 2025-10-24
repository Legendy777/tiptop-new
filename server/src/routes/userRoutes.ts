import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createUser, createUserBot,
  getUserById, getUserByIdBot, updateLanguage, updateLanguageBot, updateSubscriptionBot,
} from '../controllers/userController';

const router = express.Router();

// Bot routes
router.post('/bot', createUserBot);
router.get('/bot/:userId', getUserByIdBot);
// update user language
router.put('/bot/:userId/language', updateLanguageBot);
router.put('/bot/:userId/isSubscribed', updateSubscriptionBot);

// Client routes
router.post('/', authenticateUser, createUser);
router.get('/me', authenticateUser, getUserById);
router.put('/language', authenticateUser, updateLanguage);

export default router;