import axios from 'axios';
import { bot } from "../main";
import { configService } from '../config/config.service';

export interface User {
  _id: number;
  username: string;
  language: string;
  isBanned: boolean;
  isSubscribed: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  balanceRUB: number;
  balanceUSDT: number;
  ordersCount: number;
  referralPercent: number;
  acceptedPrivacyConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
  referralCode: string;
}

export class UserService {
  private apiUrl: string;
  private botToken: string;

  constructor() {
    // Force correct API URL to avoid environment variable issues
    this.apiUrl = 'https://tiptop.spb.ru/api'; 
    // this.apiUrl = process.env.API_URL || 'https://tiptop.spb.ru/api';
    this.botToken = process.env.AUTH_BOT_TOKEN || '';
  }

  private getHeaders() {
    return {
      'Token': this.botToken,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/users/bot/${userId}`, {
        headers: this.getHeaders()
      });
      return this.mapUser(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.warn(`⚠️ Ошибка при получении пользователя ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * Создать нового пользователя
   */
  async createUser(userData: {
    _id: number;
    username?: string;
    language?: string;
    referredBy?: number | null;
  }): Promise<User> {
    try {
      // Получаем фото профиля (не блокируем создание, если не удастся)
      let avatarUrl = '';
      try {
        const photos = await bot.telegram.getUserProfilePhotos(userData._id, 0, 1);
        if (photos.total_count > 0) {
          const fileId = photos.photos[0][0].file_id;
          const file = await bot.telegram.getFile(fileId);
          avatarUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
        }
      } catch (e) {
        console.warn('Failed to fetch user avatar', e);
      }

      const response = await axios.post(`${this.apiUrl}/users/bot`, {
        userId: userData._id,
        username: userData.username || `user_${userData._id}`,
        avatarUrl,
        language: userData.language,
        referralId: userData.referredBy
      }, {
        headers: this.getHeaders()
      });

      return this.mapUser(response.data);
    } catch (error: any) {
      console.warn(`⚠️ Ошибка при создании пользователя ${userData._id}:`, error.message);
      throw error;
    }
  }

  /**
   * Получить или создать пользователя
   */
  async getOrCreateUser(userData: {
    _id: number;
    username?: string;
    language?: string;
    referredBy?: number | null;
  }): Promise<{ user: User; isNew: boolean }> {
    try {
      let user = await this.getUserById(userData._id);
      if (user) {
        return { user, isNew: false };
      }

      user = await this.createUser(userData);
      return { user, isNew: true };
    } catch (error: any) {
      console.warn(`⚠️ Ошибка в getOrCreateUser:`, error.message);
      // Fallback only if absolutely necessary, or rethrow
      throw error;
    }
  }

  /**
   * Обновить язык пользователя
   */
  async updateLanguage(userId: number, updateData: { language?: string }): Promise<User> {
    try {
      if (!updateData.language) return (await this.getUserById(userId))!;

      const response = await axios.put(`${this.apiUrl}/users/bot/${userId}/language`, {
        language: updateData.language
      }, {
        headers: this.getHeaders()
      });
      return this.mapUser(response.data);
    } catch (error: any) {
      console.warn(`⚠️ Ошибка при обновлении языка:`, error.message);
      throw error;
    }
  }

  /**
   * Обновить статус подписки
   */
  async updateSubscription(userId: number, updateData: { isSubscribed?: boolean }): Promise<User | null> {
    try {
      if (updateData.isSubscribed === undefined) return await this.getUserById(userId);

      const response = await axios.put(`${this.apiUrl}/users/bot/${userId}/isSubscribed`, {
        isSubscribed: updateData.isSubscribed
      }, {
        headers: this.getHeaders()
      });
      return this.mapUser(response.data);
    } catch (error: any) {
      console.warn(`⚠️ Ошибка при обновлении подписки:`, error.message);
      throw error;
    }
  }

  private mapUser(apiUser: any): User {
    // Преобразуем ответ API в формат User, который ожидает бот
    // Сервер возвращает telegramId как string (BigInt serialization)
    // Нам нужно привести это к ожидаемому интерфейсу
    return {
      _id: Number(apiUser.telegramId), // или apiUser.id если мы используем internal id
      username: apiUser.username,
      language: apiUser.language,
      isBanned: apiUser.isBanned,
      isSubscribed: apiUser.isSubscribed,
      isAdmin: false, // TODO: Add isAdmin to server model or logic
      avatarUrl: apiUser.avatarUrl,
      balanceRUB: Number(apiUser.balanceRUB),
      balanceUSDT: Number(apiUser.balanceUSDT),
      ordersCount: apiUser.ordersCount,
      referralPercent: Number(apiUser.referralPercent),
      acceptedPrivacyConsent: apiUser.acceptedPrivacyConsent,
      createdAt: new Date(apiUser.createdAt),
      updatedAt: new Date(apiUser.updatedAt),
      referralCode: `ref_${apiUser.telegramId}`,
    };
  }
}

// Экспортируем singleton instance
export const userService = new UserService();
