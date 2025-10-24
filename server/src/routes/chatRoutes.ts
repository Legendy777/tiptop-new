import express from 'express';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// User routes
// router.post('/', authenticateUser, createChat);
// router.get('/:clientId', authenticateUser, getChat);
// router.post('/:clientId/messages', authenticateUser, sendMessage);

// Admin routes
// router.get('/', authenticateUser, isAdmin, getAllChats)

export default router;