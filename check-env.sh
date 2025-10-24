#!/bin/bash

echo "🔍 Проверка переменных окружения..."
echo ""

MISSING=0

check_var() {
    if [ -z "${!1}" ]; then
        echo "❌ $1 не установлена"
        MISSING=1
    else
        echo "✅ $1 установлена"
    fi
}

check_var "BOT_TOKEN"
check_var "BOT_USERNAME"
check_var "ADMIN_ID"
check_var "MONGODB_URI"

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  ПОЖАЛУЙСТА, ДОБАВЬТЕ НЕДОСТАЮЩИЕ СЕКРЕТЫ:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Откройте панель Tools (🔧) → Secrets (🔒)"
    echo "2. Добавьте следующие секреты:"
    echo ""
    echo "   BOT_TOKEN = ваш_токен_от_@BotFather"
    echo "   BOT_USERNAME = @ваш_бот"
    echo "   ADMIN_ID = ваш_telegram_id"
    echo "   MONGODB_URI = mongodb+srv://..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📖 Инструкция по MongoDB Atlas (бесплатно):"
    echo ""
    echo "   1. Перейдите на https://www.mongodb.com/atlas"
    echo "   2. Нажмите 'Try Free' и зарегистрируйтесь"
    echo "   3. Создайте бесплатный кластер M0 (512 МБ)"
    echo "   4. Создайте пользователя БД"
    echo "   5. Добавьте IP 0.0.0.0/0 в Network Access"
    echo "   6. Нажмите Connect → Drivers"
    echo "   7. Скопируйте строку подключения"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

echo ""
echo "✅ Все переменные окружения настроены!"
echo ""
