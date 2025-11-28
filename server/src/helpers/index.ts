import { logger } from '../config/logger';
import Order from '../models/Order';
import Offer from '../models/Offer';
import Game from '../models/Game';
import crypto from 'crypto';

export const getMaxOrderId = async (): Promise<number> => {
  try {
    const maxOrder = await Order.findOne().sort({ _id: -1 }).select('_id');
    return maxOrder?._id || 0; // Return 0 if no orders exist
  } catch (error) {
    logger.error(`Error fetching max order ID: ${error}`);
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

// Removed Mongo-only helpers for models that are currently disabled (Payment, OrderDetails, Withdrawal, Transaction, Referral, Review)
