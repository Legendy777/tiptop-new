# 🤖 Kiro AI Setup Script для Railway (PowerShell)
# Автоматическая настройка интеграции

Write-Host "🚀 Настройка Kiro AI для Railway проекта..." -ForegroundColor Green
Write-Host ""

# Проверка Railway CLI
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayInstalled) {
    Write-Host "⚠️  Railway CLI не установлен" -ForegroundColor Yellow
    Write-Host "Установите: npm install -g @railway/cli"
    Write-Host ""
}

# Проверка GitHub CLI
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "⚠️  GitHub CLI не установлен" -ForegroundColor Yellow
    Write-Host "Установите: https://cli.github.com/"
    Write-Host ""
}

# Запрос Kiro API ключа
Write-Host "📝 Введите ваш Kiro API ключ:" -ForegroundColor Green
$KIRO_API_KEY = Read-Host "KIRO_API_KEY"

if ([string]::IsNullOrWhiteSpace($KIRO_API_KEY)) {
    Write-Host "❌ API ключ обязателен!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ API ключ получен" -ForegroundColor Green
Write-Host ""

# Выбор варианта интеграции
Write-Host "Выберите вариант интеграции:"
Write-Host "1) GitHub Actions (рекомендуется)"
Write-Host "2) Railway Webhook"
Write-Host "3) API в Server"
Write-Host "4) Все варианты"
$CHOICE = Read-Host "Ваш выбор (1-4)"

Write-Host ""

# GitHub Actions
if ($CHOICE -eq "1" -or $CHOICE -eq "4") {
    Write-Host "🔧 Настройка GitHub Actions..." -ForegroundColor Green
    
    if ($ghInstalled) {
        # Добавление secret через GitHub CLI
        $KIRO_API_KEY | gh secret set KIRO_API_KEY
        Write-Host "✅ GitHub Secret добавлен" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Добавьте вручную:" -ForegroundColor Yellow
        Write-Host "1. Откройте Settings → Secrets and variables → Actions"
        Write-Host "2. New repository secret"
        Write-Host "3. Name: KIRO_API_KEY"
        Write-Host "4. Value: $KIRO_API_KEY"
    }
    Write-Host ""
}

# Railway Webhook
if ($CHOICE -eq "2" -or $CHOICE -eq "4") {
    Write-Host "🔧 Настройка Railway Webhook..." -ForegroundColor Green
    
    # Генерация webhook secret
    $WEBHOOK_SECRET = -join ((48..57) + (97..102) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    if ($railwayInstalled) {
        railway variables set KIRO_API_KEY="$KIRO_API_KEY"
        railway variables set RAILWAY_WEBHOOK_SECRET="$WEBHOOK_SECRET"
        railway variables set WEBHOOK_PORT="3003"
        Write-Host "✅ Railway переменные добавлены" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Добавьте вручную в Railway Dashboard:" -ForegroundColor Yellow
        Write-Host "KIRO_API_KEY=$KIRO_API_KEY"
        Write-Host "RAILWAY_WEBHOOK_SECRET=$WEBHOOK_SECRET"
        Write-Host "WEBHOOK_PORT=3003"
    }
    
    Write-Host ""
    Write-Host "📝 Настройте webhook в Railway:" -ForegroundColor Yellow
    Write-Host "1. Откройте ваш проект на Railway"
    Write-Host "2. Settings → Webhooks → Add Webhook"
    Write-Host "3. URL: https://your-webhook.railway.app/webhook/railway"
    Write-Host "4. Secret: $WEBHOOK_SECRET"
    Write-Host "5. Events: deployment.success"
    Write-Host ""
}

# API в Server
if ($CHOICE -eq "3" -or $CHOICE -eq "4") {
    Write-Host "🔧 Настройка API в Server..." -ForegroundColor Green
    
    if ($railwayInstalled) {
        railway variables set KIRO_API_KEY="$KIRO_API_KEY" --service server
        Write-Host "✅ Переменная добавлена в server service" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Добавьте вручную в Railway для сервиса 'server':" -ForegroundColor Yellow
        Write-Host "KIRO_API_KEY=$KIRO_API_KEY"
    }
    Write-Host ""
}

# Проверка файлов
Write-Host "🔍 Проверка созданных файлов..." -ForegroundColor Green

$FILES = @(
    ".github\workflows\kiro-review.yml",
    "server\src\routes\kiroRoutes.ts",
    "scripts\railway-webhook.js",
    "kiro-service\Dockerfile",
    "kiro-service\server.js"
)

foreach ($file in $FILES) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (отсутствует)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Следующие шаги:"
Write-Host "1. Проверьте файл KIRO_INTEGRATION_RAILWAY.md для деталей"
Write-Host "2. Создайте тестовый PR для проверки GitHub Actions"
Write-Host "3. Задеплойте изменения на Railway"
Write-Host ""
Write-Host "💡 Полезные команды:" -ForegroundColor Yellow
Write-Host "  railway logs --service server        # Логи сервера"
Write-Host "  railway logs --service kiro-webhook  # Логи webhook"
Write-Host "  gh workflow view                     # Статус GitHub Actions"
Write-Host ""
