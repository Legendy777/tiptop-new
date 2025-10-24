import { Request, Response } from 'express';
import GameOffer from '../models/Offer';
import { logger } from '../config/logger';

// -> User

// Get game offers by game ID
export const getOffersByGameId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { isEnabled } = req.query;

    logger.info('Fetching game offers by game ID', { context: { gameId, isEnabled } });

    const filter: any = { gameId: gameId };
    if (isEnabled !== undefined) {
      filter.isEnabled = isEnabled === 'true';
    }

    const gameOffers = await GameOffer.find(filter).sort({ price: 1 });

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

    const gameOffer = await GameOffer.findById(id);

    if (!gameOffer) {
      logger.warn('Game offer not found', { context: { offerId: id } });
      res.status(404).json({ message: 'Game offer not found' });
      return;
    }

    logger.info('Game offer fetched successfully', { context: { offerId: gameOffer._id } });
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

    const existingGameOffer = await GameOffer.findOne({ gameId, title });
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

    const gameOffer = new GameOffer({
      _id,
      gameId,
      title,
      imageUrl,
      priceRUB,
      priceUSDT,
      isEnabled: isEnabled !== undefined ? isEnabled : true,
    });

    await gameOffer.save();

    logger.info('Game offer created successfully', { context: { offerId: gameOffer._id } });
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

    const gameOffer = await GameOffer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!gameOffer) {
      logger.warn('Game offer not found for update', { context: { offerId: id } });
      res.status(404).json({ message: 'Game offer not found' });
      return;
    }

    logger.info('Game offer updated successfully', { context: { offerId: gameOffer._id } });
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

    const gameOffer = await GameOffer.findByIdAndDelete(id);

    if (!gameOffer) {
      logger.warn('Game offer not found for deletion', { context: { offerId: id } });
      res.status(404).json({ message: 'Game offer not found' });
      return;
    }

    logger.info('Game offer deleted successfully', { context: { offerId: gameOffer._id } });
    res.status(200).json({ message: 'Game offer deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting game offer with ID ${req.params.id}`, { context: { error } });
    res.status(500).json({ message: 'Failed to delete game offer', error });
  }
};