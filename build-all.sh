#!/bin/bash

echo "📦 Сборка всех компонентов для production..."
echo ""

# Собираем сервер
echo "🔧 Сборка сервера..."
cd /home/runner/workspace/server && npm run build

# Собираем бота
echo "🔧 Сборка бота..."
cd /home/runner/workspace/bot && npm run build

# Собираем клиент
echo "🔧 Сборка клиента..."
cd /home/runner/workspace/client && npm run build

# Собираем админку
echo "🔧 Сборка админки..."
cd /home/runner/workspace/admin && npm run build

echo ""
echo "✅ Все компоненты собраны успешно!"
