#!/usr/bin/env node

/**
 * Railway Webhook Handler для Kiro AI
 * Автоматически запускает анализ кода при деплое
 */

const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
app.use(express.json());

const PORT = process.env.WEBHOOK_PORT || 3003;
const WEBHOOK_SECRET = process.env.RAILWAY_WEBHOOK_SECRET;
const KIRO_API_KEY = process.env.KIRO_API_KEY;

// Проверка подписи Railway webhook
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Webhook эндпоинт
app.post('/webhook/railway', async (req, res) => {
  try {
    const signature = req.headers['x-railway-signature'];
    
    // Проверка подписи
    if (!verifySignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, deployment, project } = req.body;

    console.log(`📦 Railway Event: ${event}`);
    console.log(`🚀 Deployment: ${deployment.id}`);
    console.log(`📁 Project: ${project.name}`);

    // Запуск анализа при успешном деплое
    if (event === 'deployment.success') {
      console.log('✅ Deployment successful, starting Kiro analysis...');
      
      // Анализ изменений
      const { stdout: diffOutput } = await execPromise('git diff HEAD~1 HEAD --name-only');
      const changedFiles = diffOutput.trim().split('\n');
      
      console.log(`📝 Changed files: ${changedFiles.length}`);
      
      // Запуск Kiro анализа
      const analysisPrompt = `
        Проанализируй изменения в деплое:
        - Проверь безопасность
        - Найди потенциальные баги
        - Оцени производительность
        - Проверь соответствие best practices
      `;
      
      const { stdout: kiroOutput } = await execPromise(
        `kiro analyze --files "${changedFiles.join(',')}" --prompt "${analysisPrompt}"`
      );
      
      console.log('🤖 Kiro Analysis Complete');
      
      // Отправка результатов в Telegram (опционально)
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_ID) {
        await sendTelegramNotification(kiroOutput);
      }
      
      res.json({
        success: true,
        message: 'Analysis completed',
        filesAnalyzed: changedFiles.length
      });
    } else {
      res.json({ success: true, message: 'Event received' });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Отправка уведомления в Telegram
async function sendTelegramNotification(analysis) {
  const axios = require('axios');
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  
  const message = `
🤖 *Kiro AI Analysis Report*

📦 Deployment analyzed successfully

${analysis.substring(0, 3000)}
  `;
  
  await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    chat_id: adminId,
    text: message,
    parse_mode: 'Markdown'
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'railway-webhook',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎣 Railway Webhook Handler running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook/railway`);
});
