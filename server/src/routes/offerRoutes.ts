import express from 'express';
// import { authenticateUser } from '../middleware/auth';
import {
  createOffer,
  // createOffer,
  getOfferById,
  getOffersByGameId,
  // updateOffer,
  // deleteOffer,
} from '../controllers/offerController';
import {authenticateUser} from "../middleware/auth";
import {isAdmin} from "../middleware/admin";

const router = express.Router();

// User routes
router.get('/game/:gameId', getOffersByGameId);
router.get('/:id', getOfferById);

// Admin-only routes
router.post('/', authenticateUser, isAdmin, createOffer);
// router.put('/:id', authenticateUser, isAdmin, updateOffer);
// router.delete('/:id', authenticateUser, isAdmin, deleteOffer);

export default router;