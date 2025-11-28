import { Request, Response } from 'express';
import { gameRepository } from '../db';
import { logger } from '../config/logger';

// -> User

// Get all games
export const getGames = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all games');
    const games = await gameRepository.findAll();
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
    const games = await gameRepository.findActual();
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
    const games = await gameRepository.findWithDiscount();
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
    
    const allGames = await gameRepository.findAll();
    const games = allGames.filter(game => 
      game.title.toLowerCase().includes((query as string || '').toLowerCase())
    );
    
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
    const gameId = Number(id);
    if (isNaN(gameId)) {
      logger.warn('Invalid game ID', { context: { gameId: id } });
      return res.status(400).json({ error: 'Invalid game ID' });
    }
    logger.info('Fetching game by ID', { context: { gameId } });
    const game = await gameRepository.findById(gameId);
    if (!game) {
      logger.warn('Game not found', { context: { gameId } });
      return res.status(404).json({ error: 'Game not found' });
    }
    logger.info('Game fetched successfully', { context: { gameId: game.id } });
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
    const allowedFields = ['title', 'imageUrl', 'gifUrl', 'appleStoreUrl', 'googlePlayUrl', 'trailerUrl', 'hasDiscount', 'isActual', 'isEnabled'];
    const requestFields = Object.keys(req.body);
    const invalidFields = requestFields.filter((field) => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      logger.warn('Invalid fields in request body', { context: { invalidFields } });
      return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
    }

    // Check if game with same title exists
    const allGames = await gameRepository.findAll();
    const existingGame = allGames.find(g => g.title === req.body.title);
    
    if (existingGame) {
      logger.warn('Game already exists', { context: { title: req.body.title } });
      return res.status(400).json({ error: 'Game already exists' });
    }

    const game = await gameRepository.create({
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      gifUrl: req.body.gifUrl,
      appleStoreUrl: req.body.appleStoreUrl,
      googlePlayUrl: req.body.googlePlayUrl,
      trailerUrl: req.body.trailerUrl,
      hasDiscount: req.body.hasDiscount || false,
      isActual: req.body.isActual !== undefined ? req.body.isActual : true,
      isEnabled: req.body.isEnabled !== undefined ? req.body.isEnabled : true,
    });

    logger.info('Game created successfully', { context: { gameId: game.id } });
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
    const gameId = Number(id);
    if (isNaN(gameId)) {
      logger.warn('Invalid game ID for update', { context: { gameId: id } });
      return res.status(400).json({ error: 'Invalid game ID' });
    }
    logger.info('Updating game', { context: { gameId, body: req.body } });
    
    const game = await gameRepository.update(gameId, req.body);
    if (!game) {
      logger.warn('Game not found for update', { context: { gameId } });
      return res.status(404).json({ error: 'Game not found' });
    }
    
    logger.info('Game updated successfully', { context: { gameId: game.id } });
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
    const gameId = Number(id);
    if (isNaN(gameId)) {
      logger.warn('Invalid game ID for delete', { context: { gameId: id } });
      return res.status(400).json({ error: 'Invalid game ID' });
    }
    logger.info('Deleting game', { context: { gameId } });
    
    await gameRepository.delete(gameId);
    
    logger.info('Game deleted successfully', { context: { gameId } });
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    logger.error('Error deleting game', { context: { error } });
    res.status(500).json({ error: 'Error deleting game' });
  }
};
