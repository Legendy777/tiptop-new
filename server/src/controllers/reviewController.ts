import { Request, Response } from 'express';
// MONGO BACKUP: import Review from '../models/Review';
import { logger } from '../config/logger';
// MONGO BACKUP: import Order from "../models/Order";
import { prisma } from '../db/client';
import { reviewRepository, orderRepository } from '../db';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.telegramUser?.id;
    const username = req.telegramUser?.username;

    // MONGO BACKUP: const order = await Order.findById(orderId);
    const order = await orderRepository.findById(parseInt(orderId));
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId !== userId) return res.status(400).json({ message: 'Order does not belong to user' });

    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    // MONGO BACKUP: const reviewCheck = await Review.findOne({ orderId });
    const reviewCheck = await prisma.review.findUnique({
      where: { orderId: parseInt(orderId) }
    });
    if (reviewCheck) return res.status(400).json({ message: 'Review already exists' });

    // MONGO BACKUP: const payload = {
    // MONGO BACKUP:   userId,
    // MONGO BACKUP:   orderId,
    // MONGO BACKUP:   username,
    // MONGO BACKUP:   rating,
    // MONGO BACKUP:   comment
    // MONGO BACKUP: }
    // MONGO BACKUP: const review = new Review(payload);
    // MONGO BACKUP: await review.save();
    
    const review = await reviewRepository.create({
      user: { connect: { id: userId! } },
      order: { connect: { id: parseInt(orderId) } },
      username: username || '',
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    logger.error(`Error creating review: ${error}`);
    res.status(400).json({ message: 'Error creating review', error });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    // MONGO BACKUP: const reviews = await Review.find().sort({ createdAt: -1 });
    const reviews = await reviewRepository.findAll();
    
    // Format dates
    const formattedReviews = reviews.map(review => {
      const date = new Date(review.createdAt);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      const formattedDate = `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
      
      return {
        ...review,
        created_at: formattedDate
      };
    });
    
    res.json(formattedReviews);
  } catch (error) {
    logger.error(`Error fetching reviews: ${error}`);
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};
