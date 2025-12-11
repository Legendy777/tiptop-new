import { config } from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные окружения
config();

/**
 * 🔧 Централизованный сервис конфигурации
 * Управляет всеми настройками приложения и валидирует переменные окружения
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: Record<string, any> = {};

  private constructor() {
    this.loadAndValidateConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Загружает и валидирует конфигурацию
   */
  private loadAndValidateConfig(): void {
    // Обязательные переменные
    const requiredVars = {
      BOT_TOKEN: process.env.BOT_TOKEN,
      BOT_USERNAME: process.env.BOT_USERNAME,
    };

    // Проверяем обязательные переменные
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value) {
        throw new Error(`❌ Обязательная переменная окружения ${key} не установлена!`);
      }
    }

    // Дополнительные вычисляемые значения
    let resolvedWebAppUrl = process.env.WEB_APP_URL
      || process.env.CLIENT_URL
      || process.env.VITE_API_URL
      || 'https://tiptop.spb.ru';

    if (resolvedWebAppUrl.includes('example.com')) {
      resolvedWebAppUrl = 'https://tiptop.spb.ru';
    }

    // Загружаем все настройки
    this.config = {
      // 🤖 Telegram Bot
      bot: {
        token: this.getEnvVar('BOT_TOKEN'),
        username: this.getEnvVar('BOT_USERNAME'),
      },

      // 👨‍💻 Администрирование
      admin: {
        id: this.getEnvVar('ADMIN_ID'),
      },

      // 📢 Каналы и ссылки
      channels: {
        channelUrl: this.getEnvVar('CHANNEL_URL', 'https://t.me/tiptop_mgn'),
        catalogUrl: this.getEnvVar('CATALOG_URL', 'https://t.me/mobile_games_tp'),
        supportUrl: this.getEnvVar('SUPPORT_URL', 'https://t.me/tiptop_support'),
      },

      // 🌐 Web приложение
      webApp: {
        // WEB_APP_URL берём из окружения, а если отсутствует — пробуем CLIENT_URL или VITE_API_URL
        url: resolvedWebAppUrl,
        googlePlayUrl: this.getEnvVar('DEFAULT_GOOGLE_PLAY_URL', 'https://play.google.com'),
        appStoreUrl: this.getEnvVar('DEFAULT_APP_STORE_URL', 'https://www.apple.com/app-store/'),
      },

      // 🎮 Медиа ресурсы
      media: {
        welcomeGifRu: this.getEnvVar('WELCOME_GIF_RU', 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHppdWQzb3MxbzNndjhlZTFiMHpwYnI3Z2l0dGp4czc4dGppZGJiYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NjCzN2GiZFlLjgHJO4/giphy.gif'),
        welcomeGifEn: this.getEnvVar('WELCOME_GIF_EN', 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHppdWQzb3MxbzNndjhlZTFiMHpwYnI3Z2l0dGp4czc4dGppZGJiYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NjCzN2GiZFlLjgHJO4/giphy.gif'),
        subscribeRequestGif: this.getEnvVar('SUBSCRIBE_REQUEST_GIF', 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif'),
        defaultGifUrl: this.getEnvVar('DEFAULT_GIF_URL', 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif'),
        cabinetGifUrl: this.getEnvVar('CABINET_GIF_URL', 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif'),
        placeholderImageUrl: this.getEnvVar('PLACEHOLDER_IMAGE_URL', 'https://via.placeholder.com/800x400?text=Game+Not+Available'),
      },

      // ⚙️ Настройки производительности
      performance: {
        messageUpdateDebounceDelay: this.getEnvNumber('MESSAGE_UPDATE_DEBOUNCE_DELAY', 100),
        maxPendingUpdateTime: this.getEnvNumber('MAX_PENDING_UPDATE_TIME', 5000),
        cleanupInterval: this.getEnvNumber('CLEANUP_INTERVAL', 30000),
      },

      // 🔒 Безопасность
      security: {
        rateLimitMaxRequests: this.getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 30),
        rateLimitWindowMs: this.getEnvNumber('RATE_LIMIT_WINDOW_MS', 60000),
      },

      // 📊 Логирование
      logging: {
        level: this.getEnvVar('LOG_LEVEL', 'info'),
        toFile: this.getEnvBoolean('LOG_TO_FILE', false),
        filePath: this.getEnvVar('LOG_FILE_PATH', './logs/bot.log'),
      },

      // 🌍 Локализация
      localization: {
        defaultLanguage: this.getEnvVar('DEFAULT_LANGUAGE', 'ru'),
      },

      // 💾 База данных
      database: {
        useMockData: this.getEnvBoolean('USE_MOCK_DATA', true),
        mockDataPath: this.getEnvVar('MOCK_DATA_PATH', './src/mock/data.ts'),
      },

      // 🔄 Автоматизация
      automation: {
        slideshowInterval: this.getEnvNumber('SLIDESHOW_INTERVAL', 3000),
        slideshowMaxDuration: this.getEnvNumber('SLIDESHOW_MAX_DURATION', 30000),
      },
    };

    console.log('✅ Конфигурация успешно загружена и валидирована');
  }

  /**
   * Получает переменную окружения с возможностью указать значение по умолчанию
   */
  private getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue !== undefined) {
        console.warn(`⚠️ Переменная ${key} не установлена, используется значение по умолчанию: ${defaultValue}`);
        return defaultValue;
      }
      throw new Error(`❌ Переменная окружения ${key} не установлена и не имеет значения по умолчанию!`);
    }
    return value;
  }

  /**
   * Получает числовую переменную окружения
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) {
      console.warn(`⚠️ Переменная ${key} не установлена, используется значение по умолчанию: ${defaultValue}`);
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(`⚠️ Переменная ${key} не является числом, используется значение по умолчанию: ${defaultValue}`);
      return defaultValue;
    }
    return parsed;
  }

  /**
   * Получает булевую переменную окружения
   */
  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) {
      console.warn(`⚠️ Переменная ${key} не установлена, используется значение по умолчанию: ${defaultValue}`);
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  /**
   * Получает значение конфигурации по пути
   */
  public get<T = any>(path: string): T {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        throw new Error(`❌ Конфигурация по пути '${path}' не найдена!`);
      }
      current = current[key];
    }
    
    return current as T;
  }

  /**
   * Проверяет, установлена ли переменная окружения
   */
  public has(path: string): boolean {
    try {
      this.get(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает всю конфигурацию (для отладки)
   */
  public getAll(): Record<string, any> {
    return { ...this.config };
  }

  /**
   * Получает строковое значение конфигурации с fallback
   */
  public getString(key: string, defaultValue?: string): string {
    try {
      // Сначала пытаемся получить из конфигурации
      const value = this.get<string>(key);
      return value;
    } catch {
      // Если не найдено в конфигурации, пытаемся получить из env
      const envValue = process.env[key];
      if (envValue !== undefined) {
        return envValue;
      }
      // Возвращаем значение по умолчанию или выбрасываем ошибку
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`❌ Конфигурация '${key}' не найдена!`);
    }
  }

  /**
   * Получает числовое значение конфигурации с fallback
   */
  public getNumber(key: string, defaultValue?: number): number {
    try {
      const value = this.get<number>(key);
      return value;
    } catch {
      const envValue = process.env[key];
      if (envValue !== undefined) {
        const parsed = parseInt(envValue, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`❌ Конфигурация '${key}' не найдена!`);
    }
  }

  /**
   * Валидирует конфигурацию для production
   */
  public validateForProduction(): void {
    const productionRequiredVars = [
      'bot.token',
      'bot.username',
      'admin.id',
      'channels.channelUrl',
      'webApp.url',
    ];

    const missingVars: string[] = [];
    
    for (const varPath of productionRequiredVars) {
      if (!this.has(varPath)) {
        missingVars.push(varPath);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(`❌ Для production необходимо установить следующие переменные: ${missingVars.join(', ')}`);
    }

    console.log('✅ Конфигурация готова для production');
  }
}

// Экспортируем синглтон
export const configService = ConfigService.getInstance();
