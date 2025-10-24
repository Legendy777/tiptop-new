import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createCryptoInvoice, createRubInvoice,
  getAllByMe
} from '../controllers/paymentController';

const router = express.Router();

// User routes
router.post('/crypto', authenticateUser, createCryptoInvoice);
router.post('/rub', authenticateUser, createRubInvoice)
router.get('/me', authenticateUser, getAllByMe);

export default router;
