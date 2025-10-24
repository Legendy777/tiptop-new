import { Context, MiddlewareFn } from 'telegraf';
import { configService } from '../config/config.service';
import { errorHandler } from '../utils/errorHandler';
import { localization } from '../config/localization';

/**
 * 🛡️ Rate Limiter для защиты от спама
 * Ограничивает количество запросов от пользователей
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private userRequests: Map<number, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    this.maxRequests = configService.get<number>('security.rateLimitMaxRequests');
    this.windowMs = configService.get<number>('security.rateLimitWindowMs');
    
    // Запускаем периодическую очистку устаревших записей
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.windowMs);

    errorHandler.logInfo('🛡️ Rate Limiter инициализирован', {
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
    });
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Middleware для Telegraf
   */
  public middleware(): MiddlewareFn<Context> {
    return async (ctx: Context, next: () => Promise<void>) => {
      const userId = ctx.from?.id;
      
      // Пропускаем, если нет информации о пользователе
      if (!userId) {
        return next();
      }

      // Проверяем лимит
      if (await this.isRateLimited(userId, ctx)) {
        return; // Запрос заблокирован
      }

      // Продолжаем выполнение
      return next();
    };
  }

  /**
   * Проверяет, превышен ли лимит запросов для пользователя
   */
  private async isRateLimited(userId: number, ctx: Context): Promise<boolean> {
    const now = Date.now();
    const userRecord = this.userRequests.get(userId);

    // Если записи нет или окно сброшено, создаем новую
    if (!userRecord || now > userRecord.resetTime) {
      this.userRequests.set(userId, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    // Увеличиваем счетчик
    userRecord.count++;

    // Проверяем лимит
    if (userRecord.count > this.maxRequests) {
      await this.handleRateLimitExceeded(userId, ctx, userRecord.count);
      return true;
    }

    return false;
  }

  /**
   * Обрабатывает превышение лимита запросов
   */
  private async handleRateLimitExceeded(
    userId: number,
    ctx: Context,
    requestCount: number
  ): Promise<void> {
    const userLang = (ctx as any).session?.language || 'ru';
    const timeLeft = Math.ceil((this.userRequests.get(userId)?.resetTime || 0 - Date.now()) / 1000);

    // Логируем превышение лимита
    errorHandler.logWarning('🛡️ Rate limit превышен', {
      userId,
      username: ctx.from?.username,
      requestCount,
      maxRequests: this.maxRequests,
      timeLeft,
    });

    // Отправляем сообщение пользователю
    try {
      const rateLimitMessage = this.getRateLimitMessage(userLang, timeLeft);
      await ctx.reply(rateLimitMessage);
    } catch (error) {
      errorHandler.logWarning('❌ Не удалось отправить сообщение о rate limit', error);
    }

    // Если пользователь сильно превышает лимит, уведомляем администратора
    if (requestCount > this.maxRequests * 3) {
      try {
        const adminMessage = 
          `🚨 ПОДОЗРИТЕЛЬНАЯ АКТИВНОСТЬ\n\n` +
          `👤 Пользователь: ${userId} (@${ctx.from?.username})\n` +
          `📊 Запросов: ${requestCount}/${this.maxRequests}\n` +
          `🕐 За период: ${this.windowMs / 1000}с\n` +
          `⚠️ Возможный спам или атака`;

        // Здесь можно добавить отправку уведомления администратору
        errorHandler.logWarning('🚨 Подозрительная активность обнаружена', {
          userId,
          username: ctx.from?.username,
          requestCount,
          maxRequests: this.maxRequests,
        });
      } catch (error) {
        errorHandler.logWarning('❌ Не удалось отправить уведомление о подозрительной активности', error);
      }
    }
  }

  /**
   * Получает сообщение о превышении лимита на нужном языке
   */
  private getRateLimitMessage(language: string, timeLeft: number): string {
    const messages = {
      ru: `🛡️ Слишком много запросов!\n\nПожалуйста, подождите ${timeLeft} секунд перед следующим действием.\n\n💡 Это защита от спама для стабильной работы бота.`,
      en: `🛡️ Too many requests!\n\nPlease wait ${timeLeft} seconds before the next action.\n\n💡 This is spam protection for stable bot operation.`,
    };

    return messages[language as keyof typeof messages] || messages.ru;
  }

  /**
   * Очищает устаревшие записи
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, record] of this.userRequests.entries()) {
      if (now > record.resetTime) {
        this.userRequests.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      errorHandler.logDebug('🧹 Rate limiter cleanup', {
        cleanedRecords: cleanedCount,
        remainingRecords: this.userRequests.size,
      });
    }
  }

  /**
   * Получает статистику rate limiter
   */
  public getStats(): {
    activeUsers: number;
    maxRequests: number;
    windowMs: number;
    topUsers: Array<{ userId: number; requests: number }>;
  } {
    const topUsers = Array.from(this.userRequests.entries())
      .map(([userId, record]) => ({ userId, requests: record.count }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      activeUsers: this.userRequests.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      topUsers,
    };
  }

  /**
   * Сбрасывает лимит для конкретного пользователя (для администратора)
   */
  public resetUserLimit(userId: number): boolean {
    const deleted = this.userRequests.delete(userId);
    if (deleted) {
      errorHandler.logInfo('🔄 Rate limit сброшен для пользователя', { userId });
    }
    return deleted;
  }

  /**
   * Проверяет, заблокирован ли пользователь
   */
  public isUserBlocked(userId: number): boolean {
    const userRecord = this.userRequests.get(userId);
    if (!userRecord) return false;

    const now = Date.now();
    return userRecord.count > this.maxRequests && now <= userRecord.resetTime;
  }

  /**
   * Получает информацию о лимитах пользователя
   */
  public getUserLimitInfo(userId: number): {
    requests: number;
    maxRequests: number;
    resetTime: number;
    timeLeft: number;
    isBlocked: boolean;
  } | null {
    const userRecord = this.userRequests.get(userId);
    if (!userRecord) {
      return {
        requests: 0,
        maxRequests: this.maxRequests,
        resetTime: 0,
        timeLeft: 0,
        isBlocked: false,
      };
    }

    const now = Date.now();
    const timeLeft = Math.max(0, userRecord.resetTime - now);
    const isBlocked = userRecord.count > this.maxRequests && timeLeft > 0;

    return {
      requests: userRecord.count,
      maxRequests: this.maxRequests,
      resetTime: userRecord.resetTime,
      timeLeft: Math.ceil(timeLeft / 1000),
      isBlocked,
    };
  }

  /**
   * Уничтожает rate limiter и очищает ресурсы
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.userRequests.clear();
    errorHandler.logInfo('🛡️ Rate Limiter уничтожен');
  }
}

// Экспортируем синглтон и middleware
export const rateLimiter = RateLimiter.getInstance();
export const rateLimitMiddleware = rateLimiter.middleware();