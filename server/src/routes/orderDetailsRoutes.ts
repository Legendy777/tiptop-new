import express from 'express';
import {
  createOrderDetails,
  getOrderDetailsByOrderId,
  updateOrderDetailsByOrderId,
} from '../controllers/orderDetailsController';
import {authenticateUser} from "../middleware/auth";

const router = express.Router();

// Route to create order details
router.post('/', authenticateUser, createOrderDetails);

// Route to get order details by order ID
router.get('/:orderId', authenticateUser, getOrderDetailsByOrderId);

// Route to update order details by order ID
router.put('/:orderId', authenticateUser, updateOrderDetailsByOrderId);

export default router;