const express = require('express');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const API_KEY = process.env.KIRO_API_KEY;

// Middleware для проверки API ключа
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Эндпоинт для анализа кода
app.post('/api/analyze', async (req, res) => {
  try {
    const { files, prompt } = req.body;
    
    console.log('🔍 Starting Kiro analysis...');
    
    // Запуск Kiro CLI
    const { stdout, stderr } = await execPromise(
      `kiro analyze --files "${files.join(',')}" --prompt "${prompt}"`
    );
    
    res.json({
      success: true,
      analysis: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Kiro analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Эндпоинт для рефакторинга
app.post('/api/refactor', async (req, res) => {
  try {
    const { file, instructions } = req.body;
    
    console.log(`🔧 Refactoring ${file}...`);
    
    const { stdout } = await execPromise(
      `kiro refactor --file "${file}" --instructions "${instructions}"`
    );
    
    res.json({
      success: true,
      result: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Refactoring failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'kiro-ai',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🤖 Kiro AI Service running on port ${PORT}`);
});
