# 🚀 Интеграция Kiro AI в Railway

> Полное руководство по интеграции AI-ассистента в ваш TipTop проект на Railway

---

## 📋 Содержание

1. [Быстрый Старт](#быстрый-старт)
2. [Вариант 1: GitHub Actions](#вариант-1-github-actions-рекомендуется)
3. [Вариант 2: Railway Webhook](#вариант-2-railway-webhook)
4. [Вариант 3: Встроенный API](#вариант-3-встроенный-api-в-server)
5. [Настройка Переменных](#настройка-переменных-окружения)
6. [Использование](#использование)

---

## ⚡ Быстрый Старт

### Что вам нужно:

1. ✅ Проект на Railway (у вас уже есть)
2. ✅ GitHub репозиторий (подключен к Railway)
3. 🔑 Kiro API ключ (получить на kiro.ai)
4. 🤖 Telegram бот (у вас уже есть)

---

## 🎯 Вариант 1: GitHub Actions (Рекомендуется)

### Преимущества:
- ✅ Автоматический анализ при каждом PR
- ✅ Не требует изменений в production коде
- ✅ Комментарии с анализом прямо в PR
- ✅ Бесплатно для публичных репозиториев

### Шаг 1: Добавьте GitHub Secrets

Перейдите в ваш репозиторий на GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

Добавьте:
```
KIRO_API_KEY=your_kiro_api_key_here
```

### Шаг 2: Workflow уже создан

Файл `.github/workflows/kiro-review.yml` уже создан в вашем проекте.

### Шаг 3: Настройте триггеры

Workflow запускается автоматически при:
- Создании Pull Request
- Обновлении PR (новые коммиты)
- Push в ветки `main` или `production`

### Шаг 4: Проверьте работу

1. Создайте новую ветку:
```bash
git checkout -b feature/test-kiro
```

2. Внесите изменения и создайте PR:
```bash
git add .
git commit -m "test: Kiro integration"
git push origin feature/test-kiro
```

3. Откройте PR на GitHub - Kiro автоматически проанализирует код!

---

## 🎣 Вариант 2: Railway Webhook

### Преимущества:
- ✅ Анализ после каждого деплоя
- ✅ Уведомления в Telegram
- ✅ Автоматическая проверка безопасности

### Шаг 1: Добавьте Webhook Service в Railway

1. Откройте ваш проект на Railway
2. Нажмите **"+ New"** → **"Empty Service"**
3. Назовите: `kiro-webhook`

### Шаг 2: Настройте переменные окружения

В Railway для сервиса `kiro-webhook`:

```env
WEBHOOK_PORT=3003
RAILWAY_WEBHOOK_SECRET=your_secret_here
KIRO_API_KEY=your_kiro_api_key
TELEGRAM_BOT_TOKEN=${{BOT_TOKEN}}
TELEGRAM_ADMIN_ID=${{ADMIN_ID}}
NODE_ENV=production
```

### Шаг 3: Создайте Dockerfile для webhook

Файл `kiro-service/Dockerfile` уже создан.

### Шаг 4: Настройте Railway Webhook

1. В Railway проекте → **Settings** → **Webhooks**
2. Нажмите **"Add Webhook"**
3. URL: `https://your-kiro-webhook.railway.app/webhook/railway`
4. Secret: тот же что в `RAILWAY_WEBHOOK_SECRET`
5. Events: выберите `deployment.success`

### Шаг 5: Деплой webhook сервиса

```bash
# Добавьте в railway.json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "kiro-service/Dockerfile"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 🔧 Вариант 3: Встроенный API в Server

### Преимущества:
- ✅ Прямой доступ из админ-панели
- ✅ Анализ по требованию
- ✅ Интеграция с существующей аутентификацией

### Шаг 1: Роуты уже созданы

Файл `server/src/routes/kiroRoutes.ts` уже создан.

### Шаг 2: Подключите роуты в server/index.ts

Добавьте после других роутов:

```typescript
app.use('/api/kiro', kiroRoutes);
```

### Шаг 3: Установите Kiro CLI в Docker

Обновите `server/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Установка Kiro CLI
RUN npm install -g @kiroai/cli

# Остальной код...
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Шаг 4: Добавьте переменную в Railway

В Railway для сервиса `server`:

```env
KIRO_API_KEY=your_kiro_api_key
```

### Шаг 5: Используйте из админ-панели

Создайте компонент в `admin/src/components/KiroPanel.tsx`:

```typescript
import { useState } from 'react';
import axios from 'axios';

export const KiroPanel = () => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/kiro/analyze', {
        files: ['server/src/controllers/*.ts'],
        prompt: 'Проверь безопасность и найди баги'
      });
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Kiro analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🤖 Kiro AI Assistant</h2>
      
      <button
        onClick={analyzeCode}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        {loading ? 'Анализирую...' : 'Анализировать код'}
      </button>

      {analysis && (
        <pre className="mt-4 p-4 bg-gray-900 rounded overflow-auto">
          {analysis}
        </pre>
      )}
    </div>
  );
};
```

---

## 🔐 Настройка Переменных Окружения

### В Railway Dashboard

Для каждого сервиса добавьте необходимые переменные:

#### Server Service
```env
KIRO_API_KEY=sk_kiro_xxxxxxxxxxxxx
```

#### Kiro Webhook Service (если используете)
```env
WEBHOOK_PORT=3003
RAILWAY_WEBHOOK_SECRET=your_webhook_secret
KIRO_API_KEY=sk_kiro_xxxxxxxxxxxxx
TELEGRAM_BOT_TOKEN=${{BOT_TOKEN}}
TELEGRAM_ADMIN_ID=${{ADMIN_ID}}
```

#### GitHub Secrets (для Actions)
```
KIRO_API_KEY=sk_kiro_xxxxxxxxxxxxx
```

---

## 🎮 Использование

### 1. Автоматический анализ PR (GitHub Actions)

Просто создайте Pull Request - Kiro автоматически:
- ✅ Проанализирует изменения
- ✅ Найдет потенциальные баги
- ✅ Проверит безопасность
- ✅ Оставит комментарий с результатами

### 2. Анализ после деплоя (Webhook)

После каждого успешного деплоя на Railway:
- ✅ Webhook запускается автоматически
- ✅ Анализирует изменения в коде
- ✅ Отправляет отчет в Telegram админу

### 3. Ручной анализ (API)

Из админ-панели или через API:

```bash
# Анализ кода
curl -X POST https://tiptop.railway.app/api/kiro/analyze \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["server/src/controllers/orderController.ts"],
    "prompt": "Найди баги и проблемы безопасности"
  }'

# Рефакторинг
curl -X POST https://tiptop.railway.app/api/kiro/refactor \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file": "server/src/controllers/userController.ts",
    "instructions": "Оптимизируй производительность"
  }'

# Проверка безопасности
curl -X POST https://tiptop.railway.app/api/kiro/security-scan \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔍 Примеры Использования

### Анализ перед деплоем

```bash
# Локально перед push
kiro analyze --files "server/src/**/*.ts" --prompt "Проверь готовность к production"
```

### Автоматическая документация

```bash
# Генерация документации API
kiro docs --directory "server/src/routes" --output "API_DOCS.md"
```

### Проверка безопасности

```bash
# Сканирование уязвимостей
kiro security-scan --project . --report security-report.json
```

### Рефакторинг кода

```bash
# Улучшение производительности
kiro refactor --file "server/src/controllers/orderController.ts" \
  --instructions "Оптимизируй запросы к БД, используй batch операции"
```

---

## 📊 Мониторинг и Логи

### Просмотр логов в Railway

```bash
# Webhook сервис
railway logs --service kiro-webhook

# Server с Kiro
railway logs --service server | grep "Kiro"
```

### GitHub Actions логи

1. Откройте ваш репозиторий
2. Перейдите в **Actions**
3. Выберите workflow **"Kiro AI Code Review"**
4. Просмотрите детали выполнения

---

## 🚨 Troubleshooting

### Проблема: Kiro CLI не найден

**Решение:**
```dockerfile
# В Dockerfile добавьте
RUN npm install -g @kiroai/cli
```

### Проблема: Webhook не срабатывает

**Проверьте:**
1. URL webhook правильный
2. Secret совпадает
3. Events включены в Railway
4. Сервис запущен

**Тест webhook:**
```bash
curl -X POST https://your-webhook.railway.app/health
```

### Проблема: GitHub Action падает

**Проверьте:**
1. KIRO_API_KEY добавлен в Secrets
2. Права на запись в PR (для комментариев)
3. Логи в Actions tab

### Проблема: Недостаточно прав

**Решение:**
Убедитесь что используете admin middleware:
```typescript
router.post('/analyze', authenticateUser, isAdmin, ...)
```

---

## 💡 Best Practices

### 1. Используйте разные ключи для разных окружений

```env
# Development
KIRO_API_KEY=sk_kiro_dev_xxxxx

# Production
KIRO_API_KEY=sk_kiro_prod_xxxxx
```

### 2. Ограничьте частоту анализа

```typescript
// Rate limiting для Kiro endpoints
import rateLimit from 'express-rate-limit';

const kiroLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10 // максимум 10 запросов
});

router.use('/api/kiro', kiroLimiter);
```

### 3. Кешируйте результаты

```typescript
// Простой кеш для повторных анализов
const analysisCache = new Map();

router.post('/analyze', async (req, res) => {
  const cacheKey = JSON.stringify(req.body);
  
  if (analysisCache.has(cacheKey)) {
    return res.json(analysisCache.get(cacheKey));
  }
  
  // ... выполнить анализ
  analysisCache.set(cacheKey, result);
});
```

### 4. Логируйте все операции

```typescript
logger.info('Kiro analysis started', {
  user: req.user.id,
  files: req.body.files,
  timestamp: new Date()
});
```

---

## 🎯 Рекомендуемая Конфигурация

Для вашего проекта TipTop рекомендую:

### ✅ Обязательно:
1. **GitHub Actions** - для автоматического review PR
2. **API в Server** - для ручного анализа из админки

### 🔄 Опционально:
3. **Railway Webhook** - если нужны уведомления после деплоя

### 📝 Конфигурация Railway

```yaml
# railway.toml (в корне проекта)
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "server"
[services.env]
KIRO_API_KEY = "${{KIRO_API_KEY}}"

[[services]]
name = "kiro-webhook"
[services.env]
KIRO_API_KEY = "${{KIRO_API_KEY}}"
WEBHOOK_PORT = "3003"
```

---

## 📚 Дополнительные Ресурсы

- [Kiro AI Documentation](https://docs.kiro.ai)
- [Railway Documentation](https://docs.railway.app)
- [GitHub Actions Guide](https://docs.github.com/actions)
- [Webhook Best Practices](https://docs.railway.app/guides/webhooks)

---

## ✅ Чеклист Интеграции

- [ ] Получен Kiro API ключ
- [ ] Добавлен в GitHub Secrets
- [ ] Добавлен в Railway переменные
- [ ] GitHub Actions workflow создан
- [ ] Kiro routes добавлены в server
- [ ] Dockerfile обновлен (если нужно)
- [ ] Webhook настроен (опционально)
- [ ] Протестирован на dev ветке
- [ ] Задеплоен на production

---

## 🎉 Готово!

Теперь у вас есть полная интеграция Kiro AI в Railway проект!

**Следующие шаги:**
1. Создайте тестовый PR для проверки GitHub Actions
2. Попробуйте API эндпоинты из админ-панели
3. Настройте webhook для уведомлений (опционально)

**Вопросы?** Проверьте раздел Troubleshooting или логи в Railway.
