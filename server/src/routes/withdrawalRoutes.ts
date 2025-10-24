import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createWithdrawal,
  getWithdrawalsByMe,
} from '../controllers/withdrawalController';

const router = express.Router();

// Create withdrawal
router.post('/', authenticateUser, createWithdrawal);

// Get withdrawals by me
router.get('/me', authenticateUser, getWithdrawalsByMe);

export default router;