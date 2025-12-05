# ⚡ Быстрый Старт - Kiro AI на Railway

> 5 минут до полной интеграции AI-ассистента

---

## 🚀 Автоматическая Установка

### Windows (PowerShell):
```powershell
.\scripts\setup-kiro.ps1
```

### Linux/Mac:
```bash
chmod +x scripts/setup-kiro.sh
./scripts/setup-kiro.sh
```

---

## 🔧 Ручная Установка (3 шага)

### Шаг 1: GitHub Secret

```bash
# Через GitHub CLI
echo "your_kiro_api_key" | gh secret set KIRO_API_KEY

# Или вручную:
# GitHub → Settings → Secrets → New secret
# Name: KIRO_API_KEY
# Value: your_kiro_api_key
```

### Шаг 2: Railway Variable

```bash
# Через Railway CLI
railway variables set KIRO_API_KEY="your_kiro_api_key"

# Или вручную:
# Railway Dashboard → Variables → New Variable
# KIRO_API_KEY = your_kiro_api_key
```

### Шаг 3: Подключить роуты

В `server/index.ts` добавьте:

```typescript
import kiroRoutes from './src/routes/kiroRoutes';

// После других роутов
app.use('/api/kiro', kiroRoutes);
```

---

## ✅ Проверка

### 1. GitHub Actions
Создайте PR - Kiro автоматически проанализирует код

### 2. API Endpoint
```bash
curl https://your-app.railway.app/api/kiro/health
```

### 3. Логи
```bash
railway logs --service server | grep "Kiro"
```

---

## 🎯 Что Дальше?

1. **Прочитайте**: `KIRO_INTEGRATION_RAILWAY.md` - полная документация
2. **Попробуйте**: Создайте тестовый PR
3. **Настройте**: Webhook для уведомлений (опционально)

---

## 💡 Быстрые Команды

```bash
# Анализ кода локально
kiro analyze --files "server/src/**/*.ts"

# Проверка безопасности
kiro security-scan --project .

# Генерация документации
kiro docs --directory "server/src/routes"

# Рефакторинг
kiro refactor --file "path/to/file.ts" --instructions "optimize performance"
```

---

## 🆘 Проблемы?

**Kiro CLI не найден:**
```bash
npm install -g @kiroai/cli
```

**Railway CLI не найден:**
```bash
npm install -g @railway/cli
railway login
```

**GitHub CLI не найден:**
```bash
# Windows (Chocolatey)
choco install gh

# Mac (Homebrew)
brew install gh

# Linux
# https://github.com/cli/cli/blob/trunk/docs/install_linux.md
```

---

## 📚 Документация

- [Полная интеграция](./KIRO_INTEGRATION_RAILWAY.md)
- [Анализ проекта](./ПОЛНЫЙ_АНАЛИЗ_ПРОЕКТА.md)
- [Kiro Docs](https://docs.kiro.ai)
- [Railway Docs](https://docs.railway.app)

---

**Готово!** 🎉 Теперь у вас есть AI-ассистент в проекте.
