import { Request, Response } from 'express';
import Game from '../models/Game';
import { logger } from '../config/logger';

// -> User

// Get all games
export const getGames = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all games');
    const games = await Game.find();
    logger.info('Games fetched successfully', { context: { count: games.length } });
    res.json(games);
  } catch (error) {
    logger.error('Error fetching games', { context: { error } });
    res.status(500).json({ error: 'Error fetching games' });
  }
};

// Get active games
export const getActiveGames = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching active games');
    const games = await Game.find({ isActive: true });
    logger.info('Active games fetched', { context: { count: games.length } });
    res.json(games);
  } catch (error) {
    logger.error('Error fetching active games', { context: { error } });
    res.status(500).json({ error: 'Error fetching active games' });
  }
};

// Get games with discounts
export const getDiscountedGames = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching discounted games');
    const games = await Game.find({ hasDiscount: true });
    logger.info('Discounted games fetched', { context: { count: games.length } });
    res.json(games);
  } catch (error) {
    logger.error('Error fetching discounted games', { context: { error } });
    res.status(500).json({ error: 'Error fetching discounted games' });
  }
};

// Search games
export const searchGames = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    logger.info('Searching games', { context: { query } });
    const games = await Game.find({
      $or: [{ title: { $regex: query, $options: 'i' } }],
    });
    logger.info('Games search completed', { context: { query, count: games.length } });
    res.json(games);
  } catch (error) {
    logger.error('Error searching games', { context: { error } });
    res.status(500).json({ error: 'Error searching games' });
  }
};

// Get game by ID
export const getGameById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Fetching game by ID', { context: { gameId: id } });
    const game = await Game.findById(id);
    if (!game) {
      logger.warn('Game not found', { context: { gameId: id } });
      return res.status(404).json({ error: 'Game not found' });
    }
    logger.info('Game fetched successfully', { context: { gameId: game._id } });
    res.json(game);
  } catch (error) {
    logger.error('Error fetching game by ID', { context: { error } });
    res.status(500).json({ error: 'Error fetching game' });
  }
};

// -> Admin

// Create a new game
export const createGame = async (req: Request, res: Response) => {
  try {
    logger.info('Creating a new game', { context: { body: req.body } });

    // Validate request body
    if (!req.body.title || !req.body.imageUrl || !req.body.gifUrl || !req.body.appleStoreUrl || !req.body.googlePlayUrl || !req.body.trailerUrl) {
      logger.warn('Invalid request body', { context: { body: req.body } });
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Get the allowed fields from the Game schema
    const allowedFields = Object.keys({"title": null, "imageUrl": null, "gifUrl": null, "appleStoreUrl": null, "googlePlayUrl": null, "trailerUrl": null, "hasDiscount": null, "isActual": null, "isEnabled": null});

    // Get the fields from the request body
    const requestFields = Object.keys(req.body);

    // Find fields in req.body that are not in the Game schema
    const invalidFields = requestFields.filter((field) => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      logger.warn('Invalid fields in request body', { context: { invalidFields } });
      return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
    }

    // Check if game already exists
    const existingGame = await Game.findOne({ title: req.body.title });
    if (existingGame) {
      logger.warn('Game already exists', { context: { title: req.body.title } });
      return res.status(400).json({ error: 'Game already exists' });
    }

    // Create a new game
    const game = new Game(req.body);
    await game.save();
    logger.info('Game created successfully', { context: { gameId: game._id } });
    res.status(201).json(game);
  } catch (error) {
    logger.error('Error creating game', { context: { error } });
    res.status(400).json({ error: 'Error creating game' });
  }
};

// Update game
export const updateGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Updating game', { context: { gameId: id, body: req.body } });
    const game = await Game.findByIdAndUpdate(id, req.body, { new: true });
    if (!game) {
      logger.warn('Game not found for update', { context: { gameId: id } });
      return res.status(404).json({ error: 'Game not found' });
    }
    logger.info('Game updated successfully', { context: { gameId: game._id } });
    res.json(game);
  } catch (error) {
    logger.error('Error updating game', { context: { error } });
    res.status(400).json({ error: 'Error updating game' });
  }
};

// Delete game
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Deleting game', { context: { gameId: id } });
    const game = await Game.findByIdAndDelete(id);
    if (!game) {
      logger.warn('Game not found for deletion', { context: { gameId: id } });
      return res.status(404).json({ error: 'Game not found' });
    }
    logger.info('Game deleted successfully', { context: { gameId: game._id } });
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    logger.error('Error deleting game', { context: { error } });
    res.status(500).json({ error: 'Error deleting game' });
  }
};