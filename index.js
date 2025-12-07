#!/usr/bin/env node

/**
 * Launcher для Tip-Top платформы на Replit
 * Запускает все 4 компонента: server, bot, client, admin
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Tip-Top Platform Launcher');
console.log('');

// Проверка переменных окружения
const requiredEnvVars = ['BOT_TOKEN', 'BOT_USERNAME', 'ADMIN_ID'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

// Проверяем DATABASE_URL (встроенная PostgreSQL в Replit)
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не найден. PostgreSQL база должна быть создана в Replit.');
  console.error('Инструкции: см. DEPLOYMENT_GUIDE.md');
  process.exit(1);
}

// Автоматически активируем PostgreSQL
if (!process.env.USE_POSTGRES) {
  process.env.USE_POSTGRES = 'true';
  console.log('ℹ️  USE_POSTGRES автоматически установлен в true');
}

if (missingVars.length > 0) {
  console.error('❌ Недостающие переменные окружения:', missingVars.join(', '));
  console.error('');
  console.error('Пожалуйста, добавьте их в Replit Secrets (🔒)');
  console.error('');
  console.error('Инструкции: см. DEPLOYMENT_GUIDE.md');
  process.exit(1);
}

// Не перезаписываем PORT - используем значение из .replit environment
// По умолчанию Replit устанавливает PORT=5000
const PORT = process.env.PORT || '3000';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
console.log(`ℹ️  Сервер будет запущен на порту: ${PORT}`);

// Автоматически устанавливаем API_URL если не задан
if (!process.env.API_URL) {
  process.env.API_URL = `http://localhost:${PORT}/api`;
  console.log(`ℹ️  API_URL установлен автоматически: ${process.env.API_URL}`);
}

// Автоматически устанавливаем CLIENT_URL (Railway) если доступен публичный домен
if (!process.env.CLIENT_URL && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.CLIENT_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  console.log(`ℹ️  CLIENT_URL (Railway) установлен: ${process.env.CLIENT_URL}`);
}

// Устанавливаем WEB_APP_URL для Telegram бота: уважать явное значение, иначе брать Railway публичный домен, иначе CLIENT_URL
if (!process.env.WEB_APP_URL) {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    process.env.WEB_APP_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    console.log(`ℹ️  WEB_APP_URL (Railway) установлен: ${process.env.WEB_APP_URL}`);
  } else if (process.env.CLIENT_URL) {
    process.env.WEB_APP_URL = process.env.CLIENT_URL;
    console.log(`ℹ️  WEB_APP_URL установлен из CLIENT_URL: ${process.env.WEB_APP_URL}`);
  } else {
    console.log(`ℹ️  WEB_APP_URL: не задан`);
  }
} else {
  console.log(`ℹ️  WEB_APP_URL (из env): ${process.env.WEB_APP_URL}`);
}
console.log('');

console.log('✅ Все переменные окружения настроены');
console.log('');
console.log('📦 Запуск компонентов...');
console.log('');

const processes = [];

// Функция для запуска процесса
function startProcess(name, cwd, command, args = []) {
  console.log(`🔧 Запуск ${name}...`);
  
  const proc = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });
  
  proc.on('error', (err) => {
    console.error(`❌ Ошибка запуска ${name}:`, err);
  });
  
  proc.on('exit', (code) => {
    console.log(`⚠️  ${name} завершился с кодом ${code}`);
  });
  
  processes.push({ name, proc });
  return proc;
}

// Выполнить команду и дождаться завершения
function runTask(name, cwd, command, args = []) {
  return new Promise((resolve) => {
    console.log(`🔧 ${name}...`);
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env },
    });
    proc.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} завершено`);
      } else {
        console.log(`⚠️ ${name} завершено с кодом ${code}`);
      }
      resolve(code);
    });
    proc.on('error', (err) => {
      console.error(`❌ Ошибка в ${name}:`, err);
      resolve(1);
    });
  });
}

// Запускаем все компоненты
const serverCwd = path.join(__dirname, 'server');
const botCwd = path.join(__dirname, 'bot');
const clientCwd = path.join(__dirname, 'client');
const adminCwd = path.join(__dirname, 'admin');

async function ensureBuilt(name, indexPath, cwd) {
  const exists = fs.existsSync(indexPath);
  if (exists) return;
  console.log(`ℹ️ ${name} dist не найден, выполняю сборку...`);
  await runTask(`${name}: npm ci`, cwd, 'npm', ['ci', '--include=dev']);
  await runTask(`${name}: build`, cwd, 'npm', ['run', 'build']);
}

// Перед запуском сервисов — попробуем выполнить миграции и сид
(async () => {
  // Собираем SPA если нужно
  await ensureBuilt('Client', path.join(__dirname, 'client', 'dist', 'index.html'), clientCwd);
  await ensureBuilt('Admin', path.join(__dirname, 'admin', 'dist', 'index.html'), adminCwd);
  // Устанавливаем зависимости сервера (включая dev), затем собираем
  await runTask('Server: npm ci', serverCwd, 'npm', ['ci', '--include=dev']);
  await runTask('Server: build', serverCwd, 'npm', ['run', 'build']);

  // Миграции БД только если не localhost
  if (process.env.DATABASE_URL && !/localhost|127\.0\.0\.1/i.test(process.env.DATABASE_URL)) {
    console.log('🗄️ Инициализация базы данных...');
    await runTask('Prisma migrate deploy', serverCwd, 'npx', ['prisma', 'migrate', 'deploy']);
    await runTask('Insert mock data', serverCwd, 'node', ['scripts/insert-mock.js']);
  } else {
    console.log('ℹ️ DATABASE_URL отсутствует или localhost — пропускаю миграции и сид');
  }
  startProcess('Server (API + Socket.IO)', serverCwd, 'npm', ['run', 'start']);
  startProcess('Bot (Telegram)', botCwd, 'npm', ['run', 'start']);
})();

console.log('');
console.log('✅ Платформа Tip-Top запущена!');
console.log('');
console.log('📍 Доступные сервисы:');
console.log(`   - API сервер: http://localhost:${PORT}`);
console.log('   - Telegram бот: активен');
console.log('');
console.log('💡 Для полного dev окружения также запустите:');
console.log('   - Клиент: cd client && npm run dev (порт 5173)');
console.log('   - Админ: cd admin && npm run dev (порт 5174)');
console.log('');
console.log('📖 Инструкции: см. DEPLOYMENT_GUIDE.md');
console.log('');

// Обработка завершения
process.on('SIGINT', () => {
  console.log('');
  console.log('⏹️  Остановка всех процессов...');
  processes.forEach(({ name, proc }) => {
    console.log(`   Останавливаю ${name}...`);
    proc.kill('SIGINT');
  });
  process.exit(0);
});

process.on('SIGTERM', () => {
  processes.forEach(({ proc }) => proc.kill('SIGTERM'));
  process.exit(0);
});

// Keep the main process alive so the container doesn't exit
setInterval(() => {}, 1 << 30);
