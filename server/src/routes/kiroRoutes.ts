import express, { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isAdmin } from '../middleware/admin';
import { authenticateUser } from '../middleware/auth';
import { logger } from '../config/logger';

const execPromise = promisify(exec);
const router = express.Router();

/**
 * Kiro AI Integration Routes
 * Доступны только для администраторов
 */

// Анализ кода
router.post('/analyze', authenticateUser, isAdmin, async (req: Request, res: Response) => {
  try {
    const { files, prompt } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Files array is required' 
      });
    }

    logger.info('Starting Kiro analysis', { files, prompt });

    // Запуск Kiro CLI
    const command = `kiro analyze --files "${files.join(',')}" ${prompt ? `--prompt "${prompt}"` : ''}`;
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      logger.warn('Kiro analysis warnings', { stderr });
    }

    res.json({
      success: true,
      analysis: stdout,
      filesAnalyzed: files.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Kiro analysis failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Analysis failed',
      error: error.message
    });
  }
});

// Рефакторинг кода
router.post('/refactor', authenticateUser, isAdmin, async (req: Request, res: Response) => {
  try {
    const { file, instructions } = req.body;

    if (!file || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'File and instructions are required'
      });
    }

    logger.info('Starting Kiro refactoring', { file, instructions });

    const command = `kiro refactor --file "${file}" --instructions "${instructions}"`;
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      logger.warn('Kiro refactoring warnings', { stderr });
    }

    res.json({
      success: true,
      result: stdout,
      file,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Kiro refactoring failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Refactoring failed',
      error: error.message
    });
  }
});

// Генерация документации
router.post('/generate-docs', authenticateUser, isAdmin, async (req: Request, res: Response) => {
  try {
    const { directory } = req.body;

    logger.info('Generating documentation with Kiro', { directory });

    const command = `kiro docs --directory "${directory || '.'}"`;
    const { stdout } = await execPromise(command);

    res.json({
      success: true,
      documentation: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Documentation generation failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Documentation generation failed',
      error: error.message
    });
  }
});

// Проверка безопасности
router.post('/security-scan', authenticateUser, isAdmin, async (req: Request, res: Response) => {
  try {
    logger.info('Starting security scan with Kiro');

    const command = 'kiro security-scan --project .';
    const { stdout } = await execPromise(command);

    res.json({
      success: true,
      securityReport: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Security scan failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Security scan failed',
      error: error.message
    });
  }
});

// Health check для Kiro
router.get('/health', async (req: Request, res: Response) => {
  try {
    const { stdout } = await execPromise('kiro --version');
    res.json({
      success: true,
      kiroVersion: stdout.trim(),
      status: 'operational'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unavailable',
      message: 'Kiro CLI not installed'
    });
  }
});

export default router;
