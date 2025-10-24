import { Telegraf } from 'telegraf';
import { localization } from '../config/localization';
import { errorHandler } from '../utils/errorHandler';

// ID администратора для уведомлений (должен быть в .env)
const ADMIN_ID = process.env.ADMIN_ID;

export class NotificationService {
  private bot: Telegraf;

  constructor(bot: Telegraf) {
    this.bot = bot;
  }

  /**
   * Отправляет уведомление администратору о новом пользователе
   */
  async notifyNewUser(userId: string, username?: string, referrerId?: string) {
    if (!ADMIN_ID) {
      errorHandler.logWarning('ADMIN_ID not set in environment variables');
      return;
    }

    try {
      const l = localization('ru'); // Уведомления администратору на русском
      let message = `🆕 Новый пользователь!\n\n`;
      message += `👤 ID: ${userId}\n`;
      
      if (username) {
        message += `📝 Username: @${username}\n`;
      }
      
      if (referrerId) {
        message += `🔗 Пришел по реферальной ссылке от: ${referrerId}\n`;
      }
      
      message += `⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
      
      await this.bot.telegram.sendMessage(ADMIN_ID, message);
    } catch (error) {
      errorHandler.logError(`Could not send new user notification (check ADMIN_ID: ${ADMIN_ID}):`, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Отправляет уведомление администратору об ошибке
   */
  async notifyError(error: Error, context?: string) {
    if (!ADMIN_ID) {
      errorHandler.logWarning('ADMIN_ID not set in environment variables');
      return;
    }

    try {
      let message = `🚨 Ошибка в боте!\n\n`;
      
      if (context) {
        message += `📍 Контекст: ${context}\n`;
      }
      
      message += `❌ Ошибка: ${error.message}\n`;
      message += `⏰ Время: ${new Date().toLocaleString('ru-RU')}`;

      await this.bot.telegram.sendMessage(ADMIN_ID, message);
    } catch (notificationError) {
      errorHandler.logError(`Could not send new user notification (check ADMIN_ID: ${ADMIN_ID}):`, notificationError instanceof Error ? notificationError.message : String(notificationError));
    }
  }

  /**
   * Отправляет уведомление администратору о критической ошибке
   */
  async notifyCriticalError(error: Error, context?: string) {
    if (!ADMIN_ID) {
      errorHandler.logWarning('ADMIN_ID not set in environment variables');
      return;
    }

    try {
      let message = `🔥 КРИТИЧЕСКАЯ ОШИБКА!\n\n`;
      
      if (context) {
        message += `📍 Контекст: ${context}\n`;
      }
      
      message += `❌ Ошибка: ${error.message}\n`;
      message += `📋 Stack: ${error.stack?.substring(0, 500)}...\n`;
      message += `⏰ Время: ${new Date().toLocaleString('ru-RU')}`;

      await this.bot.telegram.sendMessage(ADMIN_ID, message, {
        parse_mode: 'HTML'
      });
    } catch (notificationError) {
      errorHandler.logError('Error sending critical error notification:', notificationError);
    }
  }
}