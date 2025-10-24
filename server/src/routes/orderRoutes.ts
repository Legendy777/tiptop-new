import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  getOrderById,
  getOrdersByMe,
  getOrdersCountByStatus, updateOrderStatus
} from '../controllers/orderController';
import {isAdmin} from "../middleware/admin";

const router = express.Router();

// User routes
router.get('/me', authenticateUser, getOrdersByMe);
router.get('/:orderId', authenticateUser, getOrderById);
router.get('/me/status/:status/count', authenticateUser, getOrdersCountByStatus);

// Admin-only routes
router.put('/:orderId/status/:status', authenticateUser, isAdmin, updateOrderStatus);

export default router;