import Payment from '../models/Payment';
import { logger } from '../config/logger';
import Order from '../models/Order';
import Offer from '../models/Offer';
import Game from '../models/Game';
import OrderDetails from '../models/OrderDetails';
import Withdrawal from '../models/Withdrawal';
import Transaction from '../models/Transaction';
import Referral from '../models/Referral';
import crypto from 'crypto';
import Review from "../models/Review";

export const getMaxPaymentId = async (): Promise<number> => {
  try {
    const maxPayment = await Payment.findOne().sort({ _id: -1 }).select('_id');
    return maxPayment?._id || 0; // Return 0 if no payments exist
  } catch (error) {
    logger.error(`Error fetching max payment ID: ${error}`);
    return 0; // Return 0 in case of an error
  }
};

export const getMaxOrderId = async (): Promise<number> => {
  try {
    const maxOrder = await Order.findOne().sort({ _id: -1 }).select('_id');
    return maxOrder?._id || 0; // Return 0 if no orders exist
  } catch (error) {
    logger.error(`Error fetching max order ID: ${error}`);
    return 0; // Return 0 in case of an error
  }
};

export const getMaxOrderDetailsId = async (): Promise<number> => {
  try {
    const maxOrderDetails = await OrderDetails.findOne().sort({ _id: -1 }).select('_id');
    return maxOrderDetails?._id || 0; // Return 0 if no order details exist
  } catch (error) {
    logger.error(`Error fetching max order details ID: ${error}`);
    return 0; // Return 0 in case of an error
  }
};

export const getMaxOfferId = async (): Promise<number> => {
  try {
    const maxOffer = await Offer.findOne().sort({ _id: -1 }).select('_id');
    return maxOffer?._id || 0; // Return 0 if no offers exist
  } catch (error) {
    logger.error(`Error fetching max offer ID: ${error}`);
    return 0; // Return 0 in case of an error
  }
};

export const getMaxGameId = async (): Promise<number> => {
  try {
    const maxGame = await Game.findOne().sort({ _id: -1 }).select('_id');
    return maxGame?._id || 0; // Return 0 if no games exist
  } catch (error) {
    logger.error(`Error fetching max game ID: ${error}`);
    return 0; // Return 0 in case of an error
  }
};

export const getMaxWithdrawalId = async (): Promise<number> => {
  try {
    const maxWithdrawal = await Withdrawal.findOne().sort({ _id: -1 }).select('_id');
    return maxWithdrawal?._id || 0; // Return 0 if no withdrawals exist
  } catch (error) {
    logger.error(`Error fetching max withdrawal ID: ${error}`);
    return 0; // Return 0 in case of an error
  }
};

export const getMaxReviewId = async (): Promise<number> => {
  try {
    const maxReview = await Review.findOne().sort({ _id: -1 }).select('_id');
    return maxReview?._id || 0;
  } catch (error) {
    logger.error(`Error fetching max review ID: ${error}`);
    return 0;
  }
};

export const getMaxTransactionId = async (): Promise<number> => {
  try {
    const maxTransaction = await Transaction.findOne().sort({ _id: -1 }).select('_id');
    return maxTransaction?._id || 0;
  } catch (error) {
    logger.error(`Error fetching max transaction ID: ${error}`);
    return 0;
  }
};

export const getMaxReferralId = async (): Promise<number> => {
  try {
    const maxReferral = await Referral.findOne().sort({ _id: -1 }).select('_id');
    return maxReferral?._id || 0;
  } catch (error) {
    logger.error(`Error fetching max referral ID: ${error}`);
    return 0;
  }
};
