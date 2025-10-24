import { Context } from 'telegraf';
import { NotificationService } from './notifications';
import { configService } from '../config/config.service';
import { localization } from '../config/localization';

/**
 * 🚨 Централизованный обработчик ошибок
 * Управляет всеми типами ошибок в приложении
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private notificationService: NotificationService | null = null;

  private constructor() {
    // NotificationService будет инициализирован позже с экземпляром бота
    this.setupGlobalErrorHandlers();
  }

  public setNotificationService(notificationService: NotificationService): void {
    this.notificationService = notificationService;
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Настраивает глобальные обработчики ошибок
   */
  private setupGlobalErrorHandlers(): void {
    // Обработка необработанных исключений
    process.on('uncaughtException', (error: Error) => {
      console.error('🔥 Необработанное исключение:', error);
      this.handleCriticalError(error, 'uncaughtException');
    });

    // Обработка необработанных отклонений промисов
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('🔥 Необработанное отклонение промиса:', reason);
      this.handleCriticalError(new Error(String(reason)), 'unhandledRejection');
    });

    // Обработка сигналов завершения
    process.on('SIGTERM', () => this.handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.handleGracefulShutdown('SIGINT'));
  }

  /**
   * Обрабатывает ошибки в контексте Telegram бота
   */
  public async handleBotError(
    error: Error,
    ctx?: Context,
    operation?: string
  ): Promise<void> {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      operation: operation || 'unknown',
      userId: ctx?.from?.id,
      username: ctx?.from?.username,
      chatId: ctx?.chat?.id,
      timestamp: new Date().toISOString(),
    };

    console.error('🤖 Ошибка бота:', errorInfo);

    // Отправляем уведомление администратору
    if (this.notificationService) {
      try {
        await this.notificationService.notifyError(
          error,
          `Операция: ${errorInfo.operation}, Пользователь: ${errorInfo.userId} (@${errorInfo.username}), Чат: ${errorInfo.chatId}`
        );
      } catch (notificationError) {
        console.error('❌ Не удалось отправить уведомление об ошибке:', notificationError);
      }
    }

    // Отправляем пользователю дружелюбное сообщение об ошибке
    if (ctx) {
      await this.sendUserErrorMessage(ctx);
    }
  }

  /**
   * Обрабатывает критические ошибки системы
   */
  private async handleCriticalError(error: Error, type: string): Promise<void> {
    const errorInfo = {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memory: process.memoryUsage(),
    };

    console.error('🔥 Критическая ошибка:', errorInfo);

    // Отправляем критическое уведомление
    if (this.notificationService) {
      try {
        await this.notificationService.notifyCriticalError(
          error,
          `Тип: ${errorInfo.type}, PID: ${errorInfo.pid}, Память: ${Math.round(errorInfo.memory.heapUsed / 1024 / 1024)}MB`
        );
      } catch (notificationError) {
        console.error('❌ Не удалось отправить критическое уведомление:', notificationError);
      }
    }

    // Для критических ошибок можем инициировать graceful shutdown
    if (type === 'uncaughtException') {
      console.log('🔄 Инициируется graceful shutdown из-за критической ошибки...');
      setTimeout(() => {
        process.exit(1);
      }, 5000); // Даем 5 секунд на завершение текущих операций
    }
  }

  /**
   * Обрабатывает ошибки валидации
   */
  public handleValidationError(error: Error, field?: string): void {
    console.warn('⚠️ Ошибка валидации:', {
      field,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Обрабатывает ошибки сети/API
   */
  public async handleNetworkError(
    error: Error,
    endpoint?: string,
    retryCount?: number
  ): Promise<void> {
    const errorInfo = {
      endpoint: endpoint || 'unknown',
      message: error.message,
      retryCount: retryCount || 0,
      timestamp: new Date().toISOString(),
    };

    console.error('🌐 Сетевая ошибка:', errorInfo);

    // Если это повторяющаяся ошибка, уведомляем администратора
    if (retryCount && retryCount > 3 && this.notificationService) {
      try {
        await this.notificationService.notifyError(
          error,
          `Повторяющаяся сетевая ошибка. Endpoint: ${errorInfo.endpoint}, Попыток: ${errorInfo.retryCount}`
        );
      } catch (notificationError) {
        console.error('❌ Не удалось отправить уведомление о сетевой ошибке:', notificationError);
      }
    }
  }

  /**
   * Отправляет пользователю дружелюбное сообщение об ошибке
   */
  private async sendUserErrorMessage(ctx: Context): Promise<void> {
    try {
      const userLang = (ctx as any).session?.language || 'ru';
      const l = localization(userLang);
      const errorMessage = l.errors?.general || 'Произошла ошибка. Попробуйте позже или обратитесь в поддержку.';

      await ctx.reply(errorMessage);
    } catch (replyError) {
      console.error('❌ Не удалось отправить сообщение об ошибке пользователю:', replyError);
    }
  }

  /**
   * Обрабатывает graceful shutdown
   */
  private async handleGracefulShutdown(signal: string): Promise<void> {
    console.log(`🔄 Получен сигнал ${signal}, начинается graceful shutdown...`);

    if (this.notificationService) {
      try {
        // Уведомляем администратора о завершении работы
        await this.notificationService.notifyError(
          new Error(`Бот завершает работу по сигналу ${signal}`),
          `Graceful shutdown`
        );
      } catch (error) {
        console.error('❌ Не удалось отправить уведомление о завершении работы:', error);
      }
    }

    console.log('✅ Graceful shutdown завершен');
    process.exit(0);
  }

  /**
   * Логирует информационное сообщение
   */
  public logInfo(message: string, data?: any): void {
    const logLevel = configService.get<string>('logging.level');
    if (['debug', 'info', 'warn', 'error'].includes(logLevel)) {
      console.log(`ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  /**
   * Логирует предупреждение
   */
  public logWarning(message: string, data?: any): void {
    const logLevel = configService.get<string>('logging.level');
    if (['debug', 'info', 'warn', 'error'].includes(logLevel)) {
      console.warn(`⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  /**
   * Логирует отладочную информацию
   */
  public logDebug(message: string, data?: any): void {
    const logLevel = configService.get<string>('logging.level');
    if (logLevel === 'debug') {
      console.debug(`🐛 ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  /**
   * Логирует ошибку
   */
  public logError(message: string, error?: any): void {
    const logLevel = configService.get<string>('logging.level');
    if (['debug', 'info', 'warn', 'error'].includes(logLevel)) {
      console.error(`❌ ${message}`, error ? (error instanceof Error ? error.stack : JSON.stringify(error, null, 2)) : '');
    }
  }

  /**
   * Создает обертку для безопасного выполнения асинхронных операций
   */
  public wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operation?: string
  ): (...args: T) => Promise<R | undefined> {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.handleBotError(
          error instanceof Error ? error : new Error(String(error)),
          undefined,
          operation
        );
        return undefined;
      }
    };
  }

  /**
   * Создает обертку для безопасного выполнения операций с контекстом
   */
  public wrapContext<T extends any[], R>(
    fn: (ctx: Context, ...args: T) => Promise<R>,
    operation?: string
  ): (ctx: Context, ...args: T) => Promise<R | undefined> {
    return async (ctx: Context, ...args: T): Promise<R | undefined> => {
      try {
        return await fn(ctx, ...args);
      } catch (error) {
        await this.handleBotError(
          error instanceof Error ? error : new Error(String(error)),
          ctx,
          operation
        );
        return undefined;
      }
    };
  }
}

// Экспортируем синглтон
export const errorHandler = ErrorHandler.getInstance();