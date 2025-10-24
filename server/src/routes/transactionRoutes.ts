import { Router } from 'express';
import {
  getTransactionsByRefer
} from '../controllers/transactionController';
import {authenticateUser} from "../middleware/auth";

const router = Router();

// Get transactions by refer
router.get('/refer', authenticateUser, getTransactionsByRefer);

export default router;
