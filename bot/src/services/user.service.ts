import axios from "axios";
import { bot } from "../main";

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
  /**
   * Получить пользователя по ID
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      const response = await axios.get(`${process.env.API_URL}/users/bot/${userId}`, {
        headers: { 'Token': process.env.AUTH_BOT_TOKEN }
      });
      return response.data || null;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Пользователь не найден — нормальная ситуация
      }
      throw error; // Прочие ошибки — пробрасываем дальше
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
    const photos = await bot.telegram.getUserProfilePhotos(userData._id, 0, 1);
    let avatarUrl;

    if (photos.total_count > 0) {
      const fileId = photos.photos[0][0].file_id;
      const file = await bot.telegram.getFile(fileId);
      avatarUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    } else {
      avatarUrl = 'https://gravatar.com/avatar/9c88e3f5265071b9c524f12e3d584236?s=400&d=robohash&r=x';
    }

    const newUser = {
      userId: userData._id,
      username: userData.username || 'user',
      avatarUrl: avatarUrl
    };

    const response = await axios.post(process.env.API_URL + '/users/bot', newUser, {
      headers: {
        'Token': process.env.AUTH_BOT_TOKEN
      }
    })

    if (response.status === 201 && userData.referredBy) {
      const newReferral = {
        userId: userData._id,
        referId: userData.referredBy || null,
      }

      const response2 = await axios.post(process.env.API_URL + '/referrals/bot', newReferral, {
        headers: {
          'Token': process.env.AUTH_BOT_TOKEN
        }
      })
    }

    return response.data || null;
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
    let user = await this.getUserById(userData._id);
    let isNew = false;

    if (!user) {
      user = await this.createUser(userData);
      isNew = true;
    }

    return { user, isNew };
  }

  async updateLanguage(userId: number, updateData: {
    language?: string;
  }): Promise<User> {
    const response = await axios.put(process.env.API_URL + `/users/bot/${userId}/language`, updateData, {
      headers: {
        'Token': process.env.AUTH_BOT_TOKEN
      }
    })

    return response.data || null;
  }

  async updateSubscription(userId: number, updateData: {
    isSubscribed?: boolean;
  }): Promise<User | null> {
    const response = await axios.put(process.env.API_URL + `/users/bot/${userId}/isSubscribed`, updateData, {
      headers: {
        'Token': process.env.AUTH_BOT_TOKEN
      }
    })

    return response.data || null;
  }
}

// Экспортируем singleton instance
export const userService = new UserService();
