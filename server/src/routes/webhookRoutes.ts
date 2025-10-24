import express from 'express';
import {handleCryptoWebhook, handleRubWebhook} from '../controllers/webhookController';

const router = express.Router();

// Crypto payment webhook
router.post('/crypto', handleCryptoWebhook);
router.post('/rub', handleRubWebhook);

export default router; 