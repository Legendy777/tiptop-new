#!/bin/bash

# 🤖 Kiro AI Setup Script для Railway
# Автоматическая настройка интеграции

set -e

echo "🚀 Настройка Kiro AI для Railway проекта..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка наличия Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI не установлен${NC}"
    echo "Установите: npm install -g @railway/cli"
    echo "Или продолжите настройку вручную через Railway Dashboard"
    echo ""
fi

# Проверка наличия GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI не установлен${NC}"
    echo "Установите: https://cli.github.com/"
    echo ""
fi

# Запрос Kiro API ключа
echo -e "${GREEN}📝 Введите ваш Kiro API ключ:${NC}"
read -p "KIRO_API_KEY: " KIRO_API_KEY

if [ -z "$KIRO_API_KEY" ]; then
    echo -e "${RED}❌ API ключ обязателен!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ API ключ получен${NC}"
echo ""

# Выбор варианта интеграции
echo "Выберите вариант интеграции:"
echo "1) GitHub Actions (рекомендуется)"
echo "2) Railway Webhook"
echo "3) API в Server"
echo "4) Все варианты"
read -p "Ваш выбор (1-4): " CHOICE

echo ""

# GitHub Actions
if [ "$CHOICE" = "1" ] || [ "$CHOICE" = "4" ]; then
    echo -e "${GREEN}🔧 Настройка GitHub Actions...${NC}"
    
    if command -v gh &> /dev/null; then
        # Добавление secret через GitHub CLI
        echo "$KIRO_API_KEY" | gh secret set KIRO_API_KEY
        echo -e "${GREEN}✅ GitHub Secret добавлен${NC}"
    else
        echo -e "${YELLOW}⚠️  Добавьте вручную:${NC}"
        echo "1. Откройте: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/secrets/actions"
        echo "2. New repository secret"
        echo "3. Name: KIRO_API_KEY"
        echo "4. Value: $KIRO_API_KEY"
    fi
    echo ""
fi

# Railway Webhook
if [ "$CHOICE" = "2" ] || [ "$CHOICE" = "4" ]; then
    echo -e "${GREEN}🔧 Настройка Railway Webhook...${NC}"
    
    # Генерация webhook secret
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    
    if command -v railway &> /dev/null; then
        railway variables set KIRO_API_KEY="$KIRO_API_KEY"
        railway variables set RAILWAY_WEBHOOK_SECRET="$WEBHOOK_SECRET"
        railway variables set WEBHOOK_PORT="3003"
        echo -e "${GREEN}✅ Railway переменные добавлены${NC}"
    else
        echo -e "${YELLOW}⚠️  Добавьте вручную в Railway Dashboard:${NC}"
        echo "KIRO_API_KEY=$KIRO_API_KEY"
        echo "RAILWAY_WEBHOOK_SECRET=$WEBHOOK_SECRET"
        echo "WEBHOOK_PORT=3003"
    fi
    
    echo ""
    echo -e "${YELLOW}📝 Настройте webhook в Railway:${NC}"
    echo "1. Откройте ваш проект на Railway"
    echo "2. Settings → Webhooks → Add Webhook"
    echo "3. URL: https://your-webhook.railway.app/webhook/railway"
    echo "4. Secret: $WEBHOOK_SECRET"
    echo "5. Events: deployment.success"
    echo ""
fi

# API в Server
if [ "$CHOICE" = "3" ] || [ "$CHOICE" = "4" ]; then
    echo -e "${GREEN}🔧 Настройка API в Server...${NC}"
    
    if command -v railway &> /dev/null; then
        railway variables set KIRO_API_KEY="$KIRO_API_KEY" --service server
        echo -e "${GREEN}✅ Переменная добавлена в server service${NC}"
    else
        echo -e "${YELLOW}⚠️  Добавьте вручную в Railway для сервиса 'server':${NC}"
        echo "KIRO_API_KEY=$KIRO_API_KEY"
    fi
    echo ""
fi

# Проверка файлов
echo -e "${GREEN}🔍 Проверка созданных файлов...${NC}"

FILES=(
    ".github/workflows/kiro-review.yml"
    "server/src/routes/kiroRoutes.ts"
    "scripts/railway-webhook.js"
    "kiro-service/Dockerfile"
    "kiro-service/server.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (отсутствует)${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Настройка завершена!${NC}"
echo ""
echo "📚 Следующие шаги:"
echo "1. Проверьте файл KIRO_INTEGRATION_RAILWAY.md для деталей"
echo "2. Создайте тестовый PR для проверки GitHub Actions"
echo "3. Задеплойте изменения на Railway"
echo ""
echo -e "${YELLOW}💡 Полезные команды:${NC}"
echo "  railway logs --service server     # Логи сервера"
echo "  railway logs --service kiro-webhook  # Логи webhook"
echo "  gh workflow view                  # Статус GitHub Actions"
echo ""
