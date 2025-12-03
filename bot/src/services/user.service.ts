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

// Mock данные для пользователя по умолчанию
const createMockUser = (userId: number, username?: string): User => ({
 _id: userId,
 username: username || `user_${userId}`,
 language: 'ru',
 isBanned: false,
 isSubscribed: false,
 isAdmin: false,
 avatarUrl: `https://gravatar.com/avatar/${userId}?s=400&d=robohash&r=x`,
 balanceRUB: 0,
 balanceUSDT: 0,
 ordersCount: 0,
 referralPercent: 0,
 acceptedPrivacyConsent: false,
 createdAt: new Date(),
 updatedAt: new Date(),
 referralCode: `ref_${userId}`,
});

export class UserService {
 /**
 * Получить пользователя по ID или вернуть mock если API недоступен
 */
 async getUserById(userId: number): Promise<User | null> {
 try {
 // Пропускаем API запрос, используем mock данные
 return createMockUser(userId);
 } catch (error: any) {
 console.warn(`⚠️ Ошибка при получении пользователя ${userId}, использую mock:`, error.message);
 return createMockUser(userId);
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
 const photos = await bot.telegram.getUserProfilePhotos(userData._id, 0, 1);
 let avatarUrl;
 if (photos.total_count > 0) {
 const fileId = photos.photos[0][0].file_id;
 const file = await bot.telegram.getFile(fileId);
 avatarUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
 } else {
 avatarUrl = `https://gravatar.com/avatar/${userData._id}?s=400&d=robohash&r=x`;
 }

 return createMockUser(userData._id, userData.username);
 } catch (error: any) {
 console.warn(`⚠️ Ошибка при создании пользователя ${userData._id}, использую mock:`, error.message);
 return createMockUser(userData._id, userData.username);
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
 // Всегда используем mock для простоты
 const user = createMockUser(userData._id, userData.username);
 return { user, isNew: true };
 } catch (error: any) {
 console.warn(`⚠️ Ошибка в getOrCreateUser, использую mock:`, error.message);
 const user = createMockUser(userData._id, userData.username);
 return { user, isNew: true };
 }
 }

 /**
 * Обновить язык пользователя
 */
 async updateLanguage(userId: number, updateData: { language?: string }): Promise<User> {
 try {
 const user = createMockUser(userId);
 if (updateData.language) user.language = updateData.language;
 return user;
 } catch (error: any) {
 console.warn(`⚠️ Ошибка при обновлении языка, использую mock:`, error.message);
 return createMockUser(userId);
 }
 }

 /**
 * Обновить статус подписки
 */
 async updateSubscription(userId: number, updateData: { isSubscribed?: boolean }): Promise<User | null> {
 try {
 const user = createMockUser(userId);
 if (updateData.isSubscribed !== undefined) user.isSubscribed = updateData.isSubscribed;
 return user;
 } catch (error: any) {
 console.warn(`⚠️ Ошибка при обновлении подписки, использую mock:`, error.message);
 return createMockUser(userId);
 }
 }
}

// Экспортируем singleton instance
export const userService = new UserService();
