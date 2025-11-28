import { Request, Response } from 'express';
import { offerRepository, prisma } from '../db';
import { logger } from '../config/logger';

// -> User

// Get game offers by game ID
export const getOffersByGameId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { isEnabled } = req.query;

    logger.info('Fetching game offers by game ID', { context: { gameId, isEnabled } });

    let offers;
    if (isEnabled === 'true') {
      offers = await offerRepository.findEnabledByGameId(gameId);
    } else {
      offers = await offerRepository.findByGameId(gameId);
    }

    // Sort by priceRUB
    offers.sort((a, b) => Number(a.priceRUB) - Number(b.priceRUB));

    logger.info('Game offers fetched successfully by game ID', {
      context: { gameId, count: offers.length },
    });
    res.status(200).json(offers);
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

    const gameOffer = await offerRepository.findById(id);

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
      return;
    }

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

    const gameOffer = await offerRepository.update(id, req.body);

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

    await offerRepository.delete(id);

    logger.info('Game offer deleted successfully', { context: { offerId: id } });
    res.status(200).json({ message: 'Game offer deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting game offer with ID ${req.params.id}`, { context: { error } });
    res.status(500).json({ message: 'Failed to delete game offer', error });
  }
};
