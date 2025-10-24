import express from 'express';
import {
  createReview,
  getReviews
} from '../controllers/reviewController';
import {authenticateUser} from "../middleware/auth";

const router = express.Router();

// Create a new review
router.post('/', authenticateUser, createReview);

// Get all reviews
router.get('/', authenticateUser, getReviews);

export default router; 