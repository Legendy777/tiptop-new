import { Context } from 'telegraf';
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { localization } from '../config/localization';
import {Game} from "./game.service";
import {User} from "./user.service";
import { configService } from '../config/config.service';

/**
 * Сервис для работы с сообщениями и клавиатурами
 * Централизует логику создания и отправки сообщений
 */
export class MessageService {
  private userMessageIds: Map<number, number> = new Map();

  /**
   * Нормализует базовый URL веб‑приложения.
   * Источник берётся из конфигурации, либо из переданного параметра.
   * Гарантирует корректный формат и отсутствие лишних слэшей.
   */
  private getWebAppBaseUrl(preferred?: string): string {
    const raw = preferred ?? configService.get<string>('webApp.url');
    // Если значение отсутствует — возвращаем безопасный дефолт
    if (!raw) return 'https://mobile-games.online/';
    // Удаляем пробелы и приводим к строке
    const url = String(raw).trim();
    // Если нет схемы, добавляем https
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url.replace(/^\/+/, '')}`;
    }
    return url;
  }

  /**
   * Корректно склеивает базовый URL и относительный путь.
   * Учитывает наличие/отсутствие завершающего слэша у базового URL.
   */
  private joinWebAppPath(baseUrl: string, path: string): string {
    try {
      const normalizedPath = path.replace(/^\/+/, '');
      // Пытаемся собрать через URL API для надёжности
      const u = new URL(baseUrl);
      // Не теряем существующий путь, аккуратно добавляем новый сегмент
      const basePath = u.pathname?.replace(/\/+$/, '') || '';
      u.pathname = `${basePath}/${normalizedPath}`;
      return u.toString();
    } catch {
      // Фоллбэк если baseUrl не распарсился как валидный URL
      const cleanedBase = baseUrl.replace(/\/+$/, '');
      return `${cleanedBase}/${path.replace(/^\/+/, '')}`;
    }
  }

  /**
   * Получить локализацию для пользователя
   */
  private getLocalization(language?: string) {
    return language === 'en' ? localization('en') : localization('ru');
  }

  /**
   * Сохранить ID сообщения для пользователя
   */
  storeMessageId(userId: number, messageId: number): void {
    this.userMessageIds.set(userId, messageId);
  }

  /**
   * Получить ID сообщения для редактирования
   */
  getMessageIdToEdit(userId: number): number | undefined {
    return this.userMessageIds.get(userId);
  }

  /**
   * Создать постоянную клавиатуру
   */
  createPersistentKeyboard(language?: string): ReplyKeyboardMarkup {
    const loc = this.getLocalization(language);
    const webAppUrl = this.getWebAppBaseUrl();
    
    return {
      keyboard: [
        [{ text: loc.buttons.menu }],
        [{ text: loc.buttons.support, web_app: { url: this.joinWebAppPath(webAppUrl, 'chat') } }]
      ],
      resize_keyboard: true,
      is_persistent: true
    };
  }

  /**
   * Создать главное меню
   */
  createMainMenuKeyboard(language?: string, userId?: number, game?: any, isUserPlaying?: boolean): InlineKeyboardMarkup {
    const loc = this.getLocalization(language);
    
    // Определяем URL для магазинов
    const googlePlayUrl = game?.googlePlayUrl || 'https://play.google.com';
    const appStoreUrl = game?.appStoreUrl || 'https://apps.apple.com';
    const webAppUrl = this.getWebAppBaseUrl();

    // Динамическая кнопка Play/Stop
    const playStopButton = isUserPlaying
      ? { text: loc.buttons.stop, callback_data: 'banner_stop' }
      : { text: loc.buttons.play, callback_data: 'banner_play' };
    
    return {
      inline_keyboard: [
        [
          { text: loc.buttons.appStore, url: appStoreUrl },
          { text: loc.buttons.googlePlay, url: googlePlayUrl }
        ],
        [
          { text: loc.buttons.prev, callback_data: 'banner_prev' },
          playStopButton,
          { text: loc.buttons.next, callback_data: 'banner_next' }
        ],
        [
          { text: loc.buttons.catalog, url: 'https://t.me/mobile_games_tp' },
          { text: loc.buttons.news, url: 'https://t.me/tiptop_mgn' }
        ],
        [
          { text: loc.buttons.cabinet, callback_data: 'cabinet' },
          { text: loc.buttons.about, web_app: { url: this.joinWebAppPath(webAppUrl, 'about') } }
        ],
        [
          { text: loc.buttons.support, web_app: { url: this.joinWebAppPath(webAppUrl, 'chat') } },
          { text: loc.buttons.reviews, web_app: { url: this.joinWebAppPath(webAppUrl, 'reviews') } }
        ],
        [
          { text: loc.buttons.language, callback_data: 'language' },
          { text: loc.buttons.share, switch_inline_query: '' }
        ]
      ]
    };
  }

  /**
   * Создать клавиатуру личного кабинета
   */
  createCabinetKeyboard(l: any, webAppUrl: string): InlineKeyboardMarkup {
    const base = this.getWebAppBaseUrl(webAppUrl);
    return {
        inline_keyboard: [
            [
                { text: l.buttons.referralProgram, web_app: { url: base } },
                { text: l.buttons.orders, web_app: { url: base } }
            ],
            [
                { text: l.buttons.refresh, callback_data: 'refresh' },
                { text: l.buttons.withdraw, web_app: { url: base } }
            ],
            [
                { text: l.buttons.back, callback_data: 'back_to_menu' },
                { text: l.buttons.chat, web_app: { url: base } }
            ]
        ]
    };
}


  /**
   * Создать клавиатуру выбора языка
   */
  createLanguageKeyboard(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
          { text: '🇬🇧 English', callback_data: 'lang_en' }
        ]
      ]
    };
  }

  /**
   * Создать клавиатуру "Назад"
   */
  createBackKeyboard(language?: string): InlineKeyboardMarkup {
    const loc = this.getLocalization(language);
    
    return {
      inline_keyboard: [
        [{ text: loc.buttons.back, callback_data: 'back' }]
      ]
    };
  }

  /**
   * Создать клавиатуру проверки подписки
   */
  createSubscriptionKeyboard(channelUrl: string, language?: string): InlineKeyboardMarkup {
    const loc = this.getLocalization(language);
    
    return {
      inline_keyboard: [
        [
          { text: loc.buttons.subscribe, url: channelUrl }
        ],
        [
          { text: loc.buttons.checkSubscription, callback_data: 'check_subscription' }
        ]
      ]
    };
  }

  /**
   * Отправить или отредактировать сообщение с игрой
   */
  async sendOrEditGameMessage(
    ctx: Context,
    game: Game,
    caption: string,
    keyboard: InlineKeyboardMarkup,
    useGif: boolean = false
  ): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const messageIdToEdit = this.getMessageIdToEdit(userId);
    // Автоматически выбираем GIF если есть, иначе обычную картинку
    const hasGif = game.gifUrl && game.gifUrl.trim() !== '';
    const mediaUrl = hasGif ? game.gifUrl : game.imageUrl;
    const isGif = hasGif;

    try {
      if (messageIdToEdit) {
        // Пытаемся отредактировать существующее сообщение
        await ctx.telegram.editMessageMedia(
          ctx.chat!.id,
          messageIdToEdit,
          undefined,
          {
            type: isGif ? 'animation' : 'photo',
            media: mediaUrl,
            caption: caption,
            parse_mode: 'HTML'
          },
          {
            reply_markup: keyboard
          }
        );
      } else {
        throw new Error('No message to edit');
      }
    } catch (error) {
      // Если редактирование не удалось, отправляем новое сообщение
      try {
        const sentMessage = isGif 
          ? await ctx.replyWithAnimation(mediaUrl, {
              caption: caption,
              parse_mode: 'HTML',
              reply_markup: keyboard
            })
          : await ctx.replyWithPhoto(mediaUrl, {
              caption: caption,
              parse_mode: 'HTML',
              reply_markup: keyboard
            });
        
        this.storeMessageId(userId, sentMessage.message_id);
      } catch (sendError) {
        console.error('❌ Ошибка отправки сообщения:', sendError);
      }
    }
  }

  /**
   * Отправить текстовое сообщение
   */
  async sendTextMessage(
    ctx: Context,
    text: string,
    keyboard?: InlineKeyboardMarkup,
    parseMode: 'HTML' | 'Markdown' = 'HTML'
  ): Promise<void> {
    try {
      const sentMessage = await ctx.reply(text, {
        parse_mode: parseMode,
        reply_markup: keyboard
      });
      
      if (ctx.from?.id) {
        this.storeMessageId(ctx.from.id, sentMessage.message_id);
      }
    } catch (error) {
      console.error('❌ Ошибка отправки текстового сообщения:', error);
    }
  }

  /**
   * Создать подпись для игры
   */
  createGameCaption(game: Game, language?: string): string {
    const loc = this.getLocalization(language);
    
    let caption = `<b>${game.title}</b>

`;
    
    if (game.hasDiscount) {
      caption += `${loc.emojis.fire} <b>${loc.core.discount}</b>
`;
    }
    
    caption += `${loc.core.tapToPlay}`;
    
    return caption;
  }

  /**
   * Создать сообщение личного кабинета
   */
  createCabinetMessage(user: User, referralLink: string, language?: string): string {
    const loc = this.getLocalization(language);
    
    return `${loc.cabinet.title}

` +
           `${loc.cabinet.balance}: <b>${user.balanceRUB} ${loc.cabinet.currency}</b>
` +
           `${loc.cabinet.referrals}: <b>${user.referralPercent}%</b>
` +
           `${loc.cabinet.earnings}: <b>${user.balanceUSDT} USDT</b>
` +
           `${loc.cabinet.orders}: <b>${user.ordersCount}</b>

` +
           `${loc.cabinet.yourReferralLink}:
<code>${referralLink}</code>`;
  }

  /**
   * Создать сообщение "О боте"
   */
  createAboutMessage(language?: string): string {
    const loc = this.getLocalization(language);
    return loc.pages.about;
  }

  /**
   * Создать сообщение поддержки
   */
  createSupportMessage(supportUrl: string, language?: string): string {
    const loc = this.getLocalization(language);
    return `${loc.pages.support}

${supportUrl}`;
  }

  /**
   * Удалить сообщение пользователя
   */
  async deleteUserMessage(ctx: Context): Promise<void> {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      // Игнорируем ошибки удаления (сообщение может быть уже удалено)
    }
  }

  /**
   * Ответить на callback query
   */
  async answerCallbackQuery(ctx: Context, text?: string, showAlert: boolean = false): Promise<void> {
    try {
      await ctx.answerCbQuery(text, { show_alert: showAlert });
    } catch (error) {
      console.error('❌ Ошибка ответа на callback query:', error);
    }
  }

  /**
   * Очистить сохраненные ID сообщений
   */
  clearMessageIds(): void {
    this.userMessageIds.clear();
  }

  /**
   * Удалить ID сообщения для пользователя
   */
  removeMessageId(userId: number): void {
    this.userMessageIds.delete(userId);
  }
}

// Экспортируем singleton instance
export const messageService = new MessageService();
