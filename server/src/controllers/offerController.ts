import { Request, Response } from 'express';
// MONGO BACKUP: import GameOffer from '../models/Offer';
import { logger } from '../config/logger';
import { prisma } from '../db/client';
import { offerRepository } from '../db';

// -> User

// Get game offers by game ID
export const getOffersByGameId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { isEnabled } = req.query;

    logger.info('Fetching game offers by game ID', { context: { gameId, isEnabled } });

    // MONGO BACKUP: const filter: any = { gameId: gameId };
    // MONGO BACKUP: if (isEnabled !== undefined) {
    // MONGO BACKUP:   filter.isEnabled = isEnabled === 'true';
    // MONGO BACKUP: }
    // MONGO BACKUP: const gameOffers = await GameOffer.find(filter).sort({ price: 1 });

    const where: any = { gameId: parseInt(gameId) };
    if (isEnabled !== undefined) {
      where.isEnabled = isEnabled === 'true';
    }

    const gameOffers = await prisma.offer.findMany({
      where,
      orderBy: { priceRUB: 'asc' },
      include: { game: true }
    });

    logger.info('Game offers fetched successfully by game ID', {
      context: { gameId, count: gameOffers.length },
    });
    res.status(200).json(gameOffers);
  } catch (error) {
    logger.error(`Error fetching game offers for game ID ${req.params.gameId}`, { context: { error } });
    res.status(500).json({ message: 'Failed to fetch game offers', error });
  }
};

// Get a game offer by ID
export const getOfferById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Fetching game offer by ID', { context: { offerId: id } });

    // MONGO BACKUP: const gameOffer = await GameOffer.findById(id);
    const gameOffer = await offerRepository.findById(parseInt(id));

    if (!gameOffer) {
      logger.warn('Game offer not found', { context: { offerId: id } });
      res.status(404).json({ message: 'Game offer not found' });
      return;
    }

    logger.info('Game offer fetched successfully', { context: { offerId: gameOffer.id } });
    res.status(200).json(gameOffer);
  } catch (error) {
    logger.error(`Error fetching game offer with ID ${req.params.id}`, { context: { error } });
    res.status(500).json({ message: 'Failed to fetch game offer', error });
  }
};

// -> Admin

// Create a new game offer
export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Creating a new game offer', { context: { body: req.body } });
    const { _id, gameId, title, imageUrl, priceRUB, priceUSDT, isEnabled } = req.body;

    if (!gameId || !title || !imageUrl || !priceRUB || !priceUSDT) {
      logger.warn('Invalid request body', { context: { body: req.body } });
      res.status(400).json({ message: 'Invalid request body' });
      return;
    }

    // MONGO BACKUP: const existingGameOffer = await GameOffer.findOne({ gameId, title });
    const existingGameOffer = await prisma.offer.findFirst({
      where: {
        gameId: parseInt(gameId),
        title
      }
    });

    if (existingGameOffer) {
      logger.warn('Game offer already exists', { context: { gameId, title } });
      res.status(400).json({ message: 'Game offer already exists' });
      return;
    }

    if (priceRUB < 0 || priceUSDT < 0) {
      logger.warn('Invalid price', { context: { priceRUB, priceUSDT } });
      res.status(400).json({ message: 'Invalid price' });
      return;
    }

    if (typeof priceUSDT !== 'number' || typeof priceRUB !== 'number') {
      logger.warn('Invalid price type', { context: { priceRUB, priceUSDT } });
      res.status(400).json({ message: 'Invalid price type' });
    }

    // MONGO BACKUP: const gameOffer = new GameOffer({
    // MONGO BACKUP:   _id,
    // MONGO BACKUP:   gameId,
    // MONGO BACKUP:   title,
    // MONGO BACKUP:   imageUrl,
    // MONGO BACKUP:   priceRUB,
    // MONGO BACKUP:   priceUSDT,
    // MONGO BACKUP:   isEnabled: isEnabled !== undefined ? isEnabled : true,
    // MONGO BACKUP: });
    // MONGO BACKUP: await gameOffer.save();

    const gameOffer = await offerRepository.create({
      game: { connect: { id: parseInt(gameId) } },
      title,
      imageUrl,
      priceRUB,
      priceUSDT,
      isEnabled: isEnabled !== undefined ? isEnabled : true,
    });

    logger.info('Game offer created successfully', { context: { offerId: gameOffer.id } });
    res.status(201).json(gameOffer);
  } catch (error) {
    logger.error('Error creating game offer', { context: { error } });
    res.status(400).json({ message: 'Failed to create game offer', error });
  }
};

// Update a game offer
export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Updating game offer', { context: { offerId: id, body: req.body } });

    // MONGO BACKUP: const gameOffer = await GameOffer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    const gameOffer = await offerRepository.update(parseInt(id), req.body);

    if (!gameOffer) {
      logger.warn('Game offer not found for update', { context: { offerId: id } });
      res.status(404).json({ message: 'Game offer not found' });
      return;
    }

    logger.info('Game offer updated successfully', { context: { offerId: gameOffer.id } });
    res.status(200).json(gameOffer);
  } catch (error) {
    logger.error(`Error updating game offer with ID ${req.params.id}`, { context: { error } });
    res.status(400).json({ message: 'Failed to update game offer', error });
  }
};

// Delete a game offer
export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Deleting game offer', { context: { offerId: id } });

    // MONGO BACKUP: const gameOffer = await GameOffer.findByIdAndDelete(id);
    const gameOffer = await offerRepository.delete(parseInt(id));

    if (!gameOffer) {
      logger.warn('Game offer not found for deletion', { context: { offerId: id } });
      res.status(404).json({ message: 'Game offer not found' });
      return;
    }

    logger.info('Game offer deleted successfully', { context: { offerId: gameOffer.id } });
    res.status(200).json({ message: 'Game offer deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting game offer with ID ${req.params.id}`, { context: { error } });
    res.status(500).json({ message: 'Failed to delete game offer', error });
  }
};
