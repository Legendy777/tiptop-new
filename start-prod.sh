#!/bin/bash

# Проверка переменных окружения
bash check-env.sh || exit 1

export NODE_ENV=production

echo "🚀 Запуск платформы Tip-Top в режиме production..."
echo ""

# Запускаем сервер (он отдает клиент и админку как статику)
cd /home/runner/workspace/server && npm run start &
SERVER_PID=$!

# Запускаем бота
cd /home/runner/workspace/bot && npm run start &
BOT_PID=$!

echo "✅ Платформа Tip-Top запущена в production режиме!"
echo ""

# Держим процесс активным
wait $SERVER_PID $BOT_PID
