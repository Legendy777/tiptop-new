import { Context } from 'telegraf';
import { localization, WELCOME_GIFS, DEFAULT_GIF_URL, SUBSCRIBE_REQUEST_GIF, CHANNEL_URL, WEB_APP_URL, URL_CONSTANTS, DEFAULT_GOOGLE_PLAY_URL, PLACEHOLDER_IMAGE_URL } from '../config/localization';
import { checkUserSubscription } from '../utils/subscription';
import { NotificationService } from '../utils/notifications';
import { userService } from '../services/user.service';
import { gameService } from '../services/game.service';
import { messageService } from '../services/message.service';
import { stopSlideshowForUser } from './callback.handler';
import { messageUpdateManager } from '../utils/messageUpdateManager';
import { ConfigService } from '../config/config.service';
import { ErrorHandler } from '../utils/errorHandler';
import { LoggerMiddleware } from '../middleware/logger';

// Инициализируем сервисы
import { configService } from '../config/config.service';
import { errorHandler } from '../utils/errorHandler';
import { loggerMiddleware } from '../middleware/logger';

// Состояние для отслеживания сообщений пользователей
const userMessageIds: { [key: string]: number } = {};
export const bannerIndex: { [key: string]: number } = {};
export const isPlaying: { [key: string]: boolean } = {};
export const slideshowIntervals: Map<string, {
  interval: NodeJS.Timeout;
  timeout: NodeJS.Timeout;
  messageId: number;
  chatId: number;
}> = new Map();

// Мьютекс для предотвращения конкурентных обновлений сообщений
const messageUpdateMutex: Map<string, boolean> = new Map();

// Получаем URL канала из конфигурации
const getChannelUrl = () => configService.getString('CHANNEL_URL', CHANNEL_URL);

export async function handleStart(ctx: Context, notificationService?: NotificationService) {
  try {
    if (!ctx.from) return;
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;
    const languageCode = ctx.from.language_code;

    // Следуем оригинальной логике без дополнительных сообщений,
    // чтобы не ломать текущее поведение бота.

    errorHandler.logInfo(`🚀 Пользователь ${userId} (${username || firstName || 'Unknown'}) запустил бота`);
    await loggerMiddleware.logUserAction(userId, 'bot_start', { username, firstName, languageCode });

    // Извлекаем referral ID из команды start
    const startPayload = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ')[1] : undefined;
    const referralId = startPayload ? parseInt(startPayload, 10) : undefined;

    // Получаем или создаем пользователя через сервис
    const { user, isNew } = await userService.getOrCreateUser({
      _id: userId,
      username,
      language: languageCode !== 'ru' ? 'en' : 'ru',
      referredBy: referralId
    });

    if (isNew) {
      errorHandler.logInfo(`✅ Создан новый пользователь: ${userId}`);
      await loggerMiddleware.logUserAction(userId, 'user_created', { referralId });

      // Уведомляем администратора о новом пользователе
      if (notificationService) {
        await notificationService.notifyNewUser(
          `🆕 Новый пользователь: ${firstName || username || userId}`
        );
      }
    } else {
      errorHandler.logInfo(`🔄 Обновлена активность пользователя: ${userId}`);
      await loggerMiddleware.logUserAction(userId, 'bot_restart', {});
      
      if (user.isBanned) {
        errorHandler.logWarning(`User ${userId} is banned. Access denied.`);
        await loggerMiddleware.logUserAction(userId, 'access_denied_banned', {});
        const l = localization(user.language || 'ru');
        await ctx.reply(l.errors.userBlocked);
        return;
      }
    }

    // Удаляем команду /start
    if ('message' in ctx && ctx.message?.message_id) {
      try {
        await ctx.deleteMessage();
      } catch (error) {
        errorHandler.logWarning('Could not delete start message:', error);
      }
    }

    await showLanguageSelection(ctx);
  } catch (error) {
    await errorHandler.handleBotError(error instanceof Error ? error : new Error(String(error)), ctx, 'handleStart');
    if (ctx.from) {
      const user = await userService.getUserById(ctx.from.id);
      const language = user?.language || 'ru';
      const l = localization(language);
      await loggerMiddleware.logUserAction(ctx, 'start_error', { error: error instanceof Error ? error.message : String(error) });
      await ctx.reply(l.errors.startError);
    }
  }
}

export async function handleLanguageChange(ctx: Context, language: string) {
  if (!ctx.from || !ctx.chat?.id) {
    errorHandler.logWarning(`handleLanguageChange: Invalid context (from: ${ctx.from?.id}, chat: ${ctx.chat?.id})`);
    return;
  }

  const userId = ctx.from.id;
  const l = localization(language);
  const messageId = messageService.getMessageIdToEdit(ctx.from.id);
  
  // Проверяем, активно ли слайдшоу и останавливаем его
  const slideshowStopped = stopSlideshowForUser(userId.toString());


  try {
    await userService.updateLanguage(userId, { language });
    errorHandler.logInfo(`Language updated to ${language} for user ${userId}`);
    await loggerMiddleware.logUserAction(ctx, 'language_changed', { language });

    // Реальная проверка подписки на канал
    const isSubscribed = await checkUserSubscription(ctx, userId.toString());

    if (isSubscribed) {
      await userService.updateSubscription(userId, { isSubscribed: true });

      // Устанавливаем главную кнопку меню
      const webAppUrl = configService.get<string>('webApp.url');
      await ctx.setChatMenuButton({
        type: 'web_app',
        text: l.buttons.store,
        web_app: { url: webAppUrl },
      });

      // Устанавливаем постоянную клавиатуру с переводом
      const persistentKeyboard = messageService.createPersistentKeyboard(language);
      await ctx.reply(l.messages.languageSelected, {
        reply_markup: persistentKeyboard,
      });

      // Удаляем старое сообщение перед созданием нового
      if (messageId && ctx.chat?.id) {
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
          errorHandler.logInfo(`Deleted old message ${messageId} before creating new menu for user ${userId}`);
        } catch (deleteError) {
          errorHandler.logWarning(`Could not delete old message ${messageId} for user ${userId}:`, deleteError);
        }
      }
      
      // Отправляем новое главное меню
      await showMainMenu(ctx, false, undefined, language);
      
      // Отвечаем на callback query после успешного обновления меню
      try {
          if (slideshowStopped) {
            // Небольшая задержка для корректного отображения уведомления
            await new Promise(resolve => setTimeout(resolve, 100));
            await ctx.answerCbQuery(l.slideshow.stopped);
          } else {
            await ctx.answerCbQuery(l.messages.languageSelected);
          }
        } catch (cbError) {
          console.warn('Callback query already answered or expired:', cbError);
        }
    } else {
      // Логика для не подписанных пользователей
      if (messageId && ctx.chat?.id) {
        // Удаляем старое сообщение перед созданием нового
        try {
          await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
          console.log(`Deleted old message ${messageId} before creating subscription request for user ${userId}`);
        } catch (deleteError) {
          console.warn(`Could not delete old message ${messageId} for user ${userId}:`, deleteError);
        }
        
        // Отправляем новое сообщение с запросом подписки
        const keyboard = {
          inline_keyboard: [
            [{ text: l.buttons.subscribeToChannel, url: getChannelUrl() }],
            [{ text: l.buttons.checkSubscription, callback_data: 'check_subscription' }],
          ],
        };
        await ctx.replyWithAnimation(SUBSCRIBE_REQUEST_GIF, {
          caption: l.subscription.request,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
        
        try {
          if (slideshowStopped) {
            // Небольшая задержка для корректного отображения уведомления
            await new Promise(resolve => setTimeout(resolve, 100));
            await ctx.answerCbQuery(l.slideshow.stopped);
          } else {
            await ctx.answerCbQuery();
          }
        } catch (cbError) {
          errorHandler.logWarning('Callback query already answered or expired:', cbError);
        }
      }
    }
  } catch (error) {
    await errorHandler.handleBotError(error instanceof Error ? error : new Error(String(error)), ctx, 'handleLanguageChange');
    await loggerMiddleware.logUserAction(ctx, 'language_change_error', { error: error instanceof Error ? error.message : String(error) });
    try {
      await ctx.answerCbQuery(l.errors.general, { show_alert: true });
    } catch (cbError) {
      errorHandler.logWarning('Could not answer callback query:', cbError);
    }
  }
}

export async function handleCheckSubscription(ctx: Context) {
  if (!ctx.from || !ctx.callbackQuery || !ctx.chat?.id) {
    errorHandler.logWarning(`handleCheckSubscription: Invalid context (from: ${ctx.from?.id}, chat: ${ctx.chat?.id})`);
    return;
  }
  const userId = ctx.from.id;
  const data = (ctx.callbackQuery as any)?.data;
  const callbackMessageId = (ctx.callbackQuery as any)?.message?.message_id;

  const user = await userService.getUserById(userId);
  if (!user) {
    await showLanguageSelection(ctx);
    return;
  }
  const l = localization(user.language);
  const messageId = messageService.getMessageIdToEdit(ctx.from.id);

  if (!messageId) {
    errorHandler.logWarning('No message ID for subscription check');
    await showLanguageSelection(ctx);
    return;
  }

  try {
    // Реальная проверка подписки на канал
    const isSubscribed = await checkUserSubscription(ctx, userId.toString());
    await loggerMiddleware.logUserAction(ctx, 'subscription_check', { isSubscribed });

    if (isSubscribed) {
      await userService.updateSubscription(userId, { isSubscribed: true });
      await ctx.answerCbQuery(l.subscription.success);
      errorHandler.logInfo(`User ${userId} successfully subscribed to channel. Redirecting to language selection.`);

      // Вместо прямого перехода в главное меню, показываем выбор языка
      // Передаем true, так как мы только что проверили подписку
      await showLanguageSelection(ctx, true);
    } else {
      await ctx.answerCbQuery(l.subscription.failed);
      await loggerMiddleware.logUserAction(ctx, 'subscription_check_failed', {});
    }
  } catch (error) {
    await errorHandler.handleBotError(error instanceof Error ? error : new Error(String(error)), ctx, 'handleCheckSubscription');
    const lang = user?.language || 'ru';
    const l = localization(lang);
    await loggerMiddleware.logUserAction(ctx, 'subscription_check_error', { error: error instanceof Error ? error.message : String(error) });
    await ctx.answerCbQuery(l.errors.general);
  }
}

export async function showMainMenu(ctx: Context, editMessage = true, messageIdToEdit?: number, forcedLanguage?: string) {
  if (!ctx.from || !ctx.chat?.id) {
    errorHandler.logWarning(`showMainMenu: Invalid context (from: ${ctx.from?.id}, chat: ${ctx.chat?.id})`);
    return;
  }
  
  const userId = ctx.from.id;
  const mutexKey = `${userId}_${ctx.chat.id}`;
  
  // Проверяем мьютекс для предотвращения конкурентных обновлений
  if (messageUpdateMutex.get(mutexKey)) {
    errorHandler.logInfo(`Skipping showMainMenu for user ${userId} - already updating`);
    return;
  }
  
  messageUpdateMutex.set(mutexKey, true);
  
  try {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    // Получаем актуальные данные пользователя
    let language = forcedLanguage;
    if (!language) {
      const user = await userService.getUserById(userId);
      language = user ? user.language : 'ru';
    }
    
    const l = localization(language);

    const userIdStr = userId.toString();
    if (!(userIdStr in bannerIndex)) {
        bannerIndex[userIdStr] = 0;
    }
    if (!(userIdStr in isPlaying)) {
        isPlaying[userIdStr] = false;
    }

    const games = await gameService.getEnabledGames();
    if (!games || games.length === 0) {
      errorHandler.logError('No games in database');
      await loggerMiddleware.logUserAction(userId, 'no_games_error', {});
      await ctx.reply(l.errors.noGames);
      return;
    }

    if (bannerIndex[userIdStr] >= games.length) {
        bannerIndex[userIdStr] = 0;
    }

    // Используем все игры с заголовками, независимо от наличия GIF
    const validGames = games.filter((game) => game.title);
    if (validGames.length === 0) {
      errorHandler.logError('No valid games in database');
      // Фоллбэк игра
      const fallbackGame = {
        id: 0,
        title: l.system.defaultGame,
        imageUrl: PLACEHOLDER_IMAGE_URL,
        gifUrl: DEFAULT_GIF_URL,
        hasDiscount: false,
        isActual: true,
        isEnabled: true,
        appleStoreUrl: '',
        googlePlayUrl: DEFAULT_GOOGLE_PLAY_URL,
        trailerUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const menuTextFallback = `${fallbackGame.title}`;
      const keyboardFallback = messageService.createMainMenuKeyboard(language, userId, fallbackGame, isPlaying[userIdStr]);
      
      try {
        if (editMessage && messageIdToEdit && chatId) {
          messageService.storeMessageId(ctx.from.id, messageIdToEdit);
        }
        await messageService.sendOrEditGameMessage(ctx, fallbackGame, menuTextFallback, keyboardFallback);
      } catch (error) {
          errorHandler.logError('Error sending fallback game:', error);
          await ctx.reply(menuTextFallback, {
            parse_mode: 'HTML',
            reply_markup: keyboardFallback,
          });
        }
        return;
      }

      bannerIndex[userIdStr] = bannerIndex[userIdStr] % validGames.length;
      const currentGame = validGames[bannerIndex[userIdStr]];

      if (!currentGame || !currentGame.title) {
        errorHandler.logError(`Current game undefined at index ${bannerIndex[userIdStr]}, ValidGames length: ${validGames.length}`);
        bannerIndex[userIdStr] = 0;
        const fallbackGame = validGames[0];
        const menuText = `${fallbackGame.title}`;
        const keyboard = messageService.createMainMenuKeyboard(language, userId, fallbackGame, isPlaying[userIdStr]);
        
        try {
          await messageService.sendOrEditGameMessage(ctx, fallbackGame, menuText, keyboard);
        } catch (error) {
          errorHandler.logError('Error sending fallback game:', error);
          await ctx.reply(menuText, {
            parse_mode: 'HTML',
            reply_markup: keyboard,
          });
        }
        return;
      }

      const menuText = `${currentGame.title}`;
      errorHandler.logInfo(`Showing main menu for user ${userId}. Language: ${language}.`);
      errorHandler.logInfo(`Current banner text: "${menuText}", animation URL: "${currentGame.gifUrl}"`);
      await loggerMiddleware.logUserAction(userId, 'main_menu_shown', { gameId: currentGame.id, gameTitle: currentGame.title });

      const keyboard = messageService.createMainMenuKeyboard(language, userId, currentGame, isPlaying[userIdStr]);
      errorHandler.logInfo(`Building keyboard for language: ${language}`);
    const messageId = messageIdToEdit ?? messageService.getMessageIdToEdit(ctx.from.id);

    try {
        if (editMessage && messageId && ctx.chat?.id) {
          // Используем messageService для автоматического выбора медиа
          messageService.storeMessageId(ctx.from.id, messageId);
          await messageService.sendOrEditGameMessage(ctx, currentGame, menuText, keyboard);
        } else if (!editMessage && ctx.chat?.id) {
          errorHandler.logInfo(`Sending new main menu (messageId: ${messageId}, chatId: ${chatId}).`);
          await messageService.sendOrEditGameMessage(ctx, currentGame, menuText, keyboard);
        }
      } catch (error) {
        errorHandler.logError('Error sending/editing message:', error);
        // Фоллбэк - отправляем как анимацию
        const sentMessage = await ctx.replyWithAnimation(currentGame.gifUrl || currentGame.imageUrl, {
          caption: menuText,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
        messageService.storeMessageId(ctx.from.id, sentMessage.message_id);
      }
    } catch (error) {
      await errorHandler.handleBotError(error instanceof Error ? error : new Error(String(error)), ctx, 'showMainMenu');
      await loggerMiddleware.logUserAction(userId, 'main_menu_error', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      // Освобождаем мьютекс
      messageUpdateMutex.delete(mutexKey);
    }
}

// Вспомогательные функции





async function showLanguageSelection(ctx: Context, isAlreadySubscribed: boolean = false) {
  if (!ctx.from) return;
  const userId = ctx.from.id;

  // Загружаем пользователя и определяем язык интерфейса
  const user = await userService.getUserById(userId);
  const currentLanguage = user?.language || 'ru';
  const l = localization(currentLanguage);

  // 1) Всегда проверяем подписку на канал при /start
  let isSubscribed = isAlreadySubscribed;
  
  if (!isSubscribed) {
    try {
      isSubscribed = await checkUserSubscription(ctx, userId.toString());
      await loggerMiddleware.logUserAction(userId, 'subscription_check_on_start', { isSubscribed });
      // Сохраняем актуальный статус подписки (best-effort)
      await userService.updateSubscription(userId, { isSubscribed });
    } catch (subErr) {
      errorHandler.logWarning('Subscription check failed on /start:', subErr);
    }
  }

  // Если НЕ подписан — показываем запрос подписки и выходим
  if (!isSubscribed) {
    const keyboard = {
      inline_keyboard: [
        [{ text: l.buttons.subscribeToChannel, url: getChannelUrl() }],
        [{ text: l.buttons.checkSubscription, callback_data: 'check_subscription' }],
      ],
    };

    // Удаляем предыдущее сообщение если есть
    const previousMessageId = messageService.getMessageIdToEdit(userId);
    if (previousMessageId && ctx.chat?.id) {
      try {
        await ctx.deleteMessage(previousMessageId);
        errorHandler.logInfo(`Deleted previous message ${previousMessageId} for user ${userId} before showing subscription request.`);
      } catch (error) {
        errorHandler.logWarning(`Could not delete message ${previousMessageId} for user ${userId}:`, error);
      }
    }

    const subscribeMessage = await ctx.replyWithAnimation(SUBSCRIBE_REQUEST_GIF, {
      caption: l.subscription.request,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });

    if ('message_id' in subscribeMessage) {
      messageService.storeMessageId(userId, subscribeMessage.message_id);
    }
    return;
  }

  // 2) Если подписан — проверяем, выбран ли язык
  // Требование: показывать выбор языка КАЖДЫЙ раз после /start
  // Даже если язык уже был выбран ранее — предлагаем выбрать заново

  // Язык ещё не выбран — показываем выбор языка
  const keyboard = messageService.createLanguageKeyboard();
  const langSelectionGif = WELCOME_GIFS?.ru || DEFAULT_GIF_URL;

  // Удаляем предыдущее сообщение если есть
  const previousMessageId = messageService.getMessageIdToEdit(userId);
  if (previousMessageId && ctx.chat?.id) {
    try {
      await ctx.deleteMessage(previousMessageId);
      errorHandler.logInfo(`Deleted previous message ${previousMessageId} for user ${userId} before showing language selection.`);
    } catch (error) {
      errorHandler.logWarning(`Could not delete message ${previousMessageId} for user ${userId}:`, error);
    }
  }

  const message = await ctx.replyWithAnimation(langSelectionGif, {
    caption: localization('ru').system.languageSelection, // предлагаем выбор на русском/английском
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });

  if ('message_id' in message) {
    messageService.storeMessageId(userId, message.message_id);
  }
}
