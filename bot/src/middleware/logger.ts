import { Context, MiddlewareFn } from 'telegraf';
import { configService } from '../config/config.service';
import { errorHandler } from '../utils/errorHandler';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 📊 Middleware для логирования действий пользователей
 * Записывает все взаимодействия с ботом для анализа и отладки
 */
export class LoggerMiddleware {
  private static instance: LoggerMiddleware;
  private logToFile: boolean;
  private logFilePath: string;
  private logLevel: string;

  private constructor() {
    this.logToFile = configService.get<boolean>('logging.toFile');
    this.logFilePath = configService.get<string>('logging.filePath');
    this.logLevel = configService.get<string>('logging.level');

    // Создаем директорию для логов, если она не существует
    if (this.logToFile) {
      this.ensureLogDirectory();
    }

    errorHandler.logInfo('📊 Logger Middleware инициализирован', {
      logToFile: this.logToFile,
      logFilePath: this.logFilePath,
      logLevel: this.logLevel,
    });
  }

  public static getInstance(): LoggerMiddleware {
    if (!LoggerMiddleware.instance) {
      LoggerMiddleware.instance = new LoggerMiddleware();
    }
    return LoggerMiddleware.instance;
  }

  /**
   * Middleware для Telegraf
   */
  public middleware(): MiddlewareFn<Context> {
    return async (ctx: Context, next: () => Promise<void>) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      // Логируем входящий запрос
      await this.logIncomingRequest(ctx, requestId);

      try {
        // Выполняем следующий middleware
        await next();
        
        // Логируем успешное выполнение
        const duration = Date.now() - startTime;
        await this.logRequestCompletion(ctx, requestId, duration, 'success');
      } catch (error) {
        // Логируем ошибку
        const duration = Date.now() - startTime;
        await this.logRequestCompletion(ctx, requestId, duration, 'error', error);
        throw error; // Пробрасываем ошибку дальше
      }
    };
  }

  /**
   * Логирует входящий запрос
   */
  private async logIncomingRequest(ctx: Context, requestId: string): Promise<void> {
    const logData = {
      requestId,
      timestamp: new Date().toISOString(),
      type: 'incoming_request',
      user: {
        id: ctx.from?.id,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
        languageCode: ctx.from?.language_code,
        isBot: ctx.from?.is_bot,
      },
      chat: {
        id: ctx.chat?.id,
        type: ctx.chat?.type,
      },
      message: this.extractMessageInfo(ctx),
      session: this.extractSessionInfo(ctx),
    };

    await this.writeLog('info', 'Incoming request', logData);
  }

  /**
   * Логирует завершение обработки запроса
   */
  private async logRequestCompletion(
    ctx: Context,
    requestId: string,
    duration: number,
    status: 'success' | 'error',
    error?: any
  ): Promise<void> {
    const logData = {
      requestId,
      timestamp: new Date().toISOString(),
      type: 'request_completion',
      status,
      duration,
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    };

    const level = status === 'error' ? 'error' : 'info';
    const message = status === 'error' 
      ? `Request failed (${duration}ms)` 
      : `Request completed (${duration}ms)`;

    await this.writeLog(level, message, logData);
  }

  /**
   * Логирует действие пользователя
   */
  public async logUserAction(
    ctx: Context,
    action: string,
    details?: any
  ): Promise<void>;
  public async logUserAction(
    userId: number,
    action: string,
    details?: any
  ): Promise<void>;
  public async logUserAction(
    ctxOrUserId: Context | number,
    action: string,
    details?: any
  ): Promise<void> {
    let logData: any;
    
    if (typeof ctxOrUserId === 'number') {
      // Если передан userId
      logData = {
        timestamp: new Date().toISOString(),
        type: 'user_action',
        action,
        user: {
          id: ctxOrUserId,
        },
        details,
      };
    } else {
      // Если передан Context
      logData = {
        timestamp: new Date().toISOString(),
        type: 'user_action',
        action,
        user: {
          id: ctxOrUserId.from?.id,
          username: ctxOrUserId.from?.username,
        },
        chat: {
          id: ctxOrUserId.chat?.id,
          type: ctxOrUserId.chat?.type,
        },
        details,
      };
    }

    await this.writeLog('info', `User action: ${action}`, logData);
  }

  /**
   * Логирует системное событие
   */
  public async logSystemEvent(
    event: string,
    details?: any,
    level: 'debug' | 'info' | 'warn' | 'error' = 'info'
  ): Promise<void> {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'system_event',
      event,
      details,
    };

    await this.writeLog(level, `System event: ${event}`, logData);
  }

  /**
   * Логирует производительность
   */
  public async logPerformance(
    operation: string,
    duration: number,
    details?: any
  ): Promise<void> {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'performance',
      operation,
      duration,
      details,
    };

    const level = duration > 5000 ? 'warn' : 'debug';
    await this.writeLog(level, `Performance: ${operation} (${duration}ms)`, logData);
  }

  /**
   * Извлекает информацию о сообщении
   */
  private extractMessageInfo(ctx: Context): any {
    if (!ctx.message && !ctx.callbackQuery) {
      return null;
    }

    if (ctx.callbackQuery) {
      return {
        type: 'callback_query',
        data: (ctx.callbackQuery as any).data,
        messageId: (ctx.callbackQuery as any).message?.message_id,
      };
    }

    const message = ctx.message as any;
    return {
      type: 'message',
      messageId: message?.message_id,
      text: message?.text,
      command: this.extractCommand(message?.text),
      hasPhoto: !!message?.photo,
      hasDocument: !!message?.document,
      hasVideo: !!message?.video,
      hasAudio: !!message?.audio,
      hasSticker: !!message?.sticker,
      hasAnimation: !!message?.animation,
    };
  }

  /**
   * Извлекает команду из текста сообщения
   */
  private extractCommand(text?: string): string | null {
    if (!text || !text.startsWith('/')) {
      return null;
    }
    return text.split(' ')[0];
  }

  /**
   * Извлекает информацию о сессии
   */
  private extractSessionInfo(ctx: Context): any {
    const session = (ctx as any).session;
    if (!session) {
      return null;
    }

    return {
      language: session.language,
      isSubscribed: session.isSubscribed,
      currentSlide: session.currentSlide,
      slideshowActive: session.slideshowActive,
      // Не логируем чувствительные данные
    };
  }

  /**
   * Записывает лог
   */
  private async writeLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): Promise<void> {
    // Проверяем уровень логирования
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      data,
    };

    // Выводим в консоль
    if (!this.logToFile) {
      this.logToConsole(level, logEntry);
    }

    // Записываем в файл, если включено
    if (this.logToFile) {
      await this.logToFileSystem(logEntry);
    }
  }

  /**
   * Проверяет, нужно ли логировать сообщение данного уровня
   */
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Выводит лог в консоль
   */
  private logToConsole(level: string, logEntry: any): void {
    const emoji = {
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
    };

    const logMessage = `${emoji[level as keyof typeof emoji]} [${logEntry.timestamp}] ${logEntry.message}`;
    
    switch (level) {
      case 'debug':
        console.debug(logMessage, logEntry.data);
        break;
      case 'info':
        console.log(logMessage, logEntry.data);
        break;
      case 'warn':
        console.warn(logMessage, logEntry.data);
        break;
      case 'error':
        console.error(logMessage, logEntry.data);
        break;
    }
  }

  /**
   * Записывает лог в файл
   */
  private async logToFileSystem(logEntry: any): Promise<void> {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.promises.appendFile(this.logFilePath, logLine, 'utf8');
    } catch (error) {
      console.error('❌ Не удалось записать лог в файл:', error);
    }
  }

  /**
   * Создает директорию для логов
   */
  private ensureLogDirectory(): void {
    try {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        console.log(`📁 Создана директория для логов: ${logDir}`);
      }
    } catch (error) {
      console.error('❌ Не удалось создать директорию для логов:', error);
    }
  }

  /**
   * Генерирует уникальный ID запроса
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получает статистику логирования
   */
  public async getLogStats(): Promise<{
    logFileExists: boolean;
    logFileSize: number;
    logLevel: string;
    logToFile: boolean;
  }> {
    let logFileExists = false;
    let logFileSize = 0;

    if (this.logToFile) {
      try {
        const stats = await fs.promises.stat(this.logFilePath);
        logFileExists = true;
        logFileSize = stats.size;
      } catch (error) {
        // Файл не существует
      }
    }

    return {
      logFileExists,
      logFileSize,
      logLevel: this.logLevel,
      logToFile: this.logToFile,
    };
  }

  /**
   * Очищает лог-файл
   */
  public async clearLogFile(): Promise<void> {
    if (this.logToFile) {
      try {
        await fs.promises.writeFile(this.logFilePath, '', 'utf8');
        console.log('🧹 Лог-файл очищен');
      } catch (error) {
        console.error('❌ Не удалось очистить лог-файл:', error);
      }
    }
  }
}

// Экспортируем синглтон и middleware
export const loggerMiddleware = LoggerMiddleware.getInstance();
export const loggingMiddleware = loggerMiddleware.middleware();