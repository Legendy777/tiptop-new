import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  getReferralCountByReferId,
  createReferralByRefer,
} from '../controllers/referralController';

const router = express.Router();

router.post('/bot', createReferralByRefer);
router.get('/refer/count', authenticateUser, getReferralCountByReferId);

export default router;