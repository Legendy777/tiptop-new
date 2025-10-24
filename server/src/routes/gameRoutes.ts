import express from 'express';
import {
  createGame,
  getActiveGames, getDiscountedGames,
  getGameById,
  getGames,
  searchGames
} from '../controllers/gameController';
import {authenticateUser} from "../middleware/auth";
import {isAdmin} from "../middleware/admin";

const router = express.Router();

// Public routes
router.get('/', getGames);
router.get('/active', getActiveGames);
router.get('/discounts', getDiscountedGames);
router.get('/search', searchGames);
router.get('/:id', getGameById);

// Admin-only routes
router.post('/', authenticateUser, isAdmin, createGame);
// router.put('/:id', authenticateUser, isAdmin, updateGame);
// router.delete('/:id', authenticateUser, isAdmin, deleteGame);

export default router;