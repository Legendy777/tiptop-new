import { Context } from 'telegraf';
import { CHANNEL_URL } from '../config/localization';

/**
 * Проверяет подписку пользователя на канал
 * @param ctx - Контекст Telegraf
 * @param userId - ID пользователя
 * @returns Promise<boolean> - true если пользователь подписан, false если нет
 */
export async function checkUserSubscription(ctx: Context, userId: string): Promise<boolean> {
  try {
    // Извлекаем username канала из URL
    const channelUsername = extractChannelUsername(CHANNEL_URL);
    
    if (!channelUsername) {
      console.error('Не удалось извлечь username канала из URL:', CHANNEL_URL);
      return false;
    }

    // Проверяем статус пользователя в канале
    const chatMember = await ctx.telegram.getChatMember(channelUsername, parseInt(userId));
    
    // Пользователь считается подписанным, если он не покинул канал и не заблокирован
    const isSubscribed = ['creator', 'administrator', 'member'].includes(chatMember.status);
    
    console.log(`Проверка подписки для пользователя ${userId}: ${isSubscribed ? 'подписан' : 'не подписан'}`);
    
    return isSubscribed;
  } catch (error) {
    console.error('Ошибка при проверке подписки:', error);
    
    // Если канал приватный или произошла другая ошибка,
    // возвращаем false (пользователь не подписан)
    return false;
  }
}

/**
 * Извлекает username канала из Telegram URL
 * @param channelUrl - URL канала (например: https://t.me/channel_name)
 * @returns string | null - username канала или null если не удалось извлечь
 */
function extractChannelUsername(channelUrl: string): string | null {
  try {
    // Поддерживаем различные форматы URL:
    // https://t.me/channel_name
    // https://telegram.me/channel_name
    // t.me/channel_name
    // @channel_name
    
    if (channelUrl.startsWith('@')) {
      return channelUrl;
    }
    
    const match = channelUrl.match(/(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/);
    
    if (match && match[1]) {
      return `@${match[1]}`;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при извлечении username канала:', error);
    return null;
  }
}

/**
 * Получает информацию о канале
 * @param ctx - Контекст Telegraf
 * @param channelUsername - Username канала (с @)
 * @returns Promise<any> - Информация о канале или null
 */
export async function getChannelInfo(ctx: Context, channelUsername: string) {
  try {
    const chat = await ctx.telegram.getChat(channelUsername);
    return chat;
  } catch (error) {
    console.error('Ошибка при получении информации о канале:', error);
    return null;
  }
}