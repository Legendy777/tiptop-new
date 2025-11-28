import { Context } from 'telegraf';
import { localization, CABINET_GIF_URL } from '../config/localization';
import { userService } from '../services/user.service';
import { gameService } from '../services/game.service';
import { handleLanguageChange, handleCheckSubscription, showMainMenu, bannerIndex, isPlaying, slideshowIntervals } from './start.handler';
import { messageService } from '../services/message.service';
import { messageUpdateManager } from '../utils/messageUpdateManager';
import { configService } from '../config/config.service';
import { errorHandler } from '../utils/errorHandler';
import { loggerMiddleware } from '../middleware/logger';

// Сервисы импортированы как синглтоны

// Безопасная функция для ответа на callback query
export async function safeAnswerCbQuery(ctx: Context, text?: string, options?: any): Promise<void> {
  try {
    await ctx.answerCbQuery(text, options);
  } catch (error: any) {
    if (error.description?.includes('query is too old') || error.description?.includes('query ID is invalid')) {
      errorHandler.logWarning('Callback query too old or invalid, ignoring:', error.description);
    } else {
      errorHandler.logError('Error answering callback query:', error);
    }
  }
}

// Функция для остановки слайдшоу с возвратом статуса
export function stopSlideshowForUser(userId: string): boolean {
  if (slideshowIntervals.has(userId)) {
    const slideshow = slideshowIntervals.get(userId)!;
    clearInterval(slideshow.interval);
    clearTimeout(slideshow.timeout);
    slideshowIntervals.delete(userId);
    isPlaying[userId] = false;
    errorHandler.logInfo(`Slideshow stopped for user ${userId}`);
    return true;
  }
  return false;
}

export async function handleCallbackQuery(ctx: Context) {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  
  const data = (ctx.callbackQuery as any).data;
  const userId = ctx.from?.id;
  
  if (!userId) return;
  
  errorHandler.logInfo(`Callback query received: ${data} from user ${userId}`);
  await loggerMiddleware.logUserAction(ctx, 'callback_query', { data });
  
  const user = await userService.getUserById(userId);
  const language = user?.language || 'ru';
  const l = localization(language);

  try {
    switch (data) {
      case 'cabinet':
        await handleCabinet(ctx);
        break;
      case 'language':
        const newLang = language === 'ru' ? 'en' : 'ru';
        await handleLanguageChange(ctx, newLang);
        break;
      case 'lang_ru':
        await handleLanguageChange(ctx, 'ru');
        break;
      case 'lang_en':
        await handleLanguageChange(ctx, 'en');
        break;
      case 'check_subscription':
        await handleCheckSubscription(ctx);
        break;
      case 'banner_play':
        await handleBannerPlay(ctx);
        break;
      case 'banner_stop':
        await handleBannerStop(ctx);
        break;
      case 'banner_next':
        await handleBannerNext(ctx);
        break;
      case 'banner_prev':
        await handleBannerPrev(ctx);
        break;
      case 'back_to_menu':
        await handleBackToMenu(ctx);
        break;
      case 'referral_program':
        await handleReferralProgram(ctx);
        break;
      case 'orders':
        await handleOrders(ctx);
        break;
      case 'withdraw':
        await handleWithdraw(ctx);
        break;
      case 'refresh':
        await handleRefresh(ctx);
        break;
      default:
        errorHandler.logWarning(`Unknown callback data: ${data}`);
        await safeAnswerCbQuery(ctx, l.errors.general);
    }
  } catch (error) {
    errorHandler.handleBotError(error instanceof Error ? error : new Error(String(error)), ctx, 'handleCallbackQuery');
    await loggerMiddleware.logUserAction(ctx, 'callback_error', { data, error: error instanceof Error ? error.message : String(error) });
    await safeAnswerCbQuery(ctx, l.errors.general);
  }
}

async function handleCabinet(ctx: Context) {
  if (!ctx.from || !ctx.chat?.id) return;
  
  const userId = ctx.from.id;
  
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
        errorHandler.logError(`User not found for cabinet request: ${userId}`);
        await loggerMiddleware.logUserAction(ctx, 'cabinet_error', { error: 'user_not_found' });
        await safeAnswerCbQuery(ctx, 'Пользователь не найден');
        return;
    }

  const l = localization(user.language);
  const webAppUrl = configService.get<string>('webApp.url');
  
  stopSlideshowForUser(userId.toString());
  
  const referralsCount = 0; 
  const botUsername = configService.getString('BOT_USERNAME', 'TipTop999_bot');
  const referralLink = `https://t.me/${botUsername.replace('@', '')}?start=${user.referralCode || 'UNKNOWN'}`;
  
  const keyboard = messageService.createCabinetKeyboard(l, webAppUrl);
  
  const cabinetText = `🧙‍♀️ ${l.cabinet.user} @${ctx.from.username || l.cabinet.defaultUsername}
` +
    `🆔 ${l.cabinet.id} ${userId}
` +
    `📦 ${l.cabinet.ordersCount} ${user.ordersCount}
` +
    `🤝 ${l.cabinet.referralProgram}
` +
    `🛍️ ${l.cabinet.referralPurchases} 0
` +
    `💎 ${l.cabinet.referralPercent} ${user.referralPercent}%
` +
    `👥 ${l.cabinet.referrals} ${referralsCount}
` +
    `💰 ${l.cabinet.balance} ${user.balanceRUB} $
` +
    `🔗 ${l.cabinet.yourReferralLink}
` +
    `${referralLink}`;
  
  try {
    let mediaUrl = CABINET_GIF_URL;
    let mediaType: 'photo' | 'animation' = 'animation';
    
    // Безопасно пытаемся получить фото профиля
    try {
      const userProfilePhotos = await ctx.telegram.getUserProfilePhotos(ctx.from.id, 0, 1);
      if (userProfilePhotos.photos.length > 0) {
        const photo = userProfilePhotos.photos[0];
        const largestPhoto = photo[photo.length - 1];
        mediaUrl = largestPhoto.file_id;
        mediaType = 'photo';
      }
    } catch (photoError) {
      // Если не удалось получить фото профиля, используем дефолтную анимацию
      errorHandler.logInfo(`Could not get profile photo for user ${userId}, using default animation:`, photoError);
    }
    
    const messageId = ctx.callbackQuery && 'message' in ctx.callbackQuery && (ctx.callbackQuery as any).message 
      ? (ctx.callbackQuery as any).message.message_id 
      : undefined;
    
    if (messageId && ctx.chat?.id) {
        try {
            await ctx.telegram.editMessageMedia(
                ctx.chat.id,
                messageId,
                undefined,
                {
                  type: mediaType,
                  media: mediaUrl,
                  caption: cabinetText,
                  parse_mode: 'HTML'
                },
                { reply_markup: keyboard }
              );
        } catch(error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (!errorMsg.includes('message is not modified') && !errorMsg.includes('message to edit not found')) {
                errorHandler.logError('Error in handleCabinet editing message:', error);
                // Если редактирование не удалось, отправляем новое сообщение
                if (mediaType === 'photo') {
                    await ctx.replyWithPhoto(mediaUrl, { caption: cabinetText, parse_mode: 'HTML', reply_markup: keyboard });
                } else {
                    await ctx.replyWithAnimation(mediaUrl, { caption: cabinetText, parse_mode: 'HTML', reply_markup: keyboard });
                }
            }
        }
    } else {
        if (mediaType === 'photo') {
            await ctx.replyWithPhoto(mediaUrl, { caption: cabinetText, parse_mode: 'HTML', reply_markup: keyboard });
        } else {
            await ctx.replyWithAnimation(mediaUrl, { caption: cabinetText, parse_mode: 'HTML', reply_markup: keyboard });
        }
    }
  } catch (error) {
    errorHandler.logError('Error in handleCabinet:', error);
  }
  } catch (globalError) {
    errorHandler.handleBotError(globalError instanceof Error ? globalError : new Error(String(globalError)), ctx, 'handleCabinet');
    await loggerMiddleware.logUserAction(ctx, 'cabinet_critical_error', { error: globalError instanceof Error ? globalError.message : String(globalError) });
    try {
      await safeAnswerCbQuery(ctx, 'Произошла ошибка при загрузке кабинета');
    } catch (cbError) {
      errorHandler.logError('Failed to answer callback query:', cbError);
    }
    return;
  }
  
  await loggerMiddleware.logUserAction(userId, 'cabinet_shown');
  
  await safeAnswerCbQuery(ctx);
}

async function handleBannerPlay(ctx: Context) {
    if (!ctx.from || !ctx.chat?.id) return;

    const userId = ctx.from.id.toString();
    const user = await userService.getUserById(ctx.from.id);
    const l = localization(user?.language || 'ru');

    if (slideshowIntervals.has(userId)) {
        const slideshow = slideshowIntervals.get(userId)!;
        clearInterval(slideshow.interval);
        clearTimeout(slideshow.timeout);
        slideshowIntervals.delete(userId);
    }

    isPlaying[userId] = true;

    const games = await gameService.getEnabledGames();
    if (games && games.length > 1) {
        const chatId = ctx.chat.id;
        const currentMessageId = (ctx.callbackQuery as any)?.message?.message_id || 0;

        const intervalId = setInterval(async () => {
            if (!slideshowIntervals.has(userId)) {
                clearInterval(intervalId);
                return;
            }
            bannerIndex[userId] = (bannerIndex[userId] + 1) % games.length;
            // Используем менеджер обновлений для предотвращения конфликтов
            const updateKey = `${userId}_${ctx.chat?.id}_slideshow`;
            messageUpdateManager.scheduleUpdate(updateKey, () => showMainMenu(ctx, true));
        }, 6000);

        const timeoutId = setTimeout(() => {
            if (slideshowIntervals.has(userId)) {
                clearInterval(intervalId);
                isPlaying[userId] = false;
                slideshowIntervals.delete(userId);
                errorHandler.logInfo(`Slideshow auto-stopped for user ${userId}`);
            }
        }, 30000);

        slideshowIntervals.set(userId, {
            interval: intervalId,
            timeout: timeoutId,
            chatId: chatId,
            messageId: currentMessageId
        });
    }

    // Используем менеджер обновлений для первого обновления
    const updateKey = `${userId}_${ctx.chat?.id}_play`;
    messageUpdateManager.scheduleUpdate(updateKey, () => showMainMenu(ctx, true));
    await loggerMiddleware.logUserAction(parseInt(userId), 'slideshow_started');
    await safeAnswerCbQuery(ctx, l.slideshow.started);
}

async function handleBannerStop(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    const user = await userService.getUserById(ctx.from.id);
    const l = localization(user?.language || 'ru');

    stopSlideshowForUser(userId);

    // Используем менеджер обновлений для предотвращения конфликтов
    const updateKey = `${userId}_${ctx.chat?.id}_stop`;
    messageUpdateManager.scheduleUpdate(updateKey, () => showMainMenu(ctx, true));
    await loggerMiddleware.logUserAction(parseInt(userId), 'slideshow_stopped');
    await safeAnswerCbQuery(ctx, l.slideshow.stopped);
}

async function handleBannerNext(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    const user = await userService.getUserById(ctx.from.id);
    const l = localization(user?.language || 'ru');

    const slideshowStopped = stopSlideshowForUser(userId);
    const games = await gameService.getEnabledGames();

    if (games && games.length > 0) {
        // Инициализируем bannerIndex если не существует
        if (!(userId in bannerIndex)) {
            bannerIndex[userId] = 0;
        }
        bannerIndex[userId] = (bannerIndex[userId] + 1) % games.length;
        errorHandler.logInfo(`Banner next for user ${userId}: index ${bannerIndex[userId]} of ${games.length} games`);
        await loggerMiddleware.logUserAction(parseInt(userId), 'banner_next', { index: bannerIndex[userId], totalGames: games.length });
        // Используем менеджер обновлений для предотвращения конфликтов
        const updateKey = `${userId}_${ctx.chat?.id}_next`;
        messageUpdateManager.scheduleUpdate(updateKey, () => showMainMenu(ctx, true));
    }

    if (slideshowStopped) {
        await safeAnswerCbQuery(ctx, l.slideshow.stopped);
    } else {
        await safeAnswerCbQuery(ctx);
    }
}

async function handleBannerPrev(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    const user = await userService.getUserById(ctx.from.id);
    const l = localization(user?.language || 'ru');

    const slideshowStopped = stopSlideshowForUser(userId);
    const games = await gameService.getEnabledGames();

    if (games && games.length > 0) {
        // Инициализируем bannerIndex если не существует
        if (!(userId in bannerIndex)) {
            bannerIndex[userId] = 0;
        }
        bannerIndex[userId] = bannerIndex[userId] > 0 ? bannerIndex[userId] - 1 : games.length - 1;
        errorHandler.logInfo(`Banner prev for user ${userId}: index ${bannerIndex[userId]} of ${games.length} games`);
        await loggerMiddleware.logUserAction(parseInt(userId), 'banner_prev', { index: bannerIndex[userId], totalGames: games.length });
        // Используем менеджер обновлений для предотвращения конфликтов
        const updateKey = `${userId}_${ctx.chat?.id}_prev`;
        messageUpdateManager.scheduleUpdate(updateKey, () => showMainMenu(ctx, true));
    }

    if (slideshowStopped) {
        await safeAnswerCbQuery(ctx, l.slideshow.stopped);
    } else {
        await safeAnswerCbQuery(ctx);
    }
}

async function handleBackToMenu(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id.toString();
    stopSlideshowForUser(userId);
    // Используем менеджер обновлений для предотвращения конфликтов
    const updateKey = `${userId}_${ctx.chat?.id}_back`;
    messageUpdateManager.scheduleUpdate(updateKey, () => showMainMenu(ctx, true));
    await loggerMiddleware.logUserAction(parseInt(userId), 'back_to_menu');
    await safeAnswerCbQuery(ctx);
}

async function handleReferralProgram(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    const user = await userService.getUserById(userId);
    if (!user) return;

    const l = localization(user.language);
    const slideshowStopped = stopSlideshowForUser(userId.toString());
    const botUsername = configService.getString('BOT_USERNAME', 'TipTop999_bot');
    const referralLink = `https://t.me/${botUsername.replace('@', '')}?start=${user.referralCode || 'UNKNOWN'}`;
    const referralsCount = 0; // Placeholder

    const keyboard = {
        inline_keyboard: [
            [{ text: l.buttons.back, callback_data: 'cabinet' }]
        ]
    };

    const referralText = `🤝 ${l.cabinet.referralProgram}

` +
        `💎 ${l.cabinet.referralPercent} ${user.referralPercent}%
` +
        `👥 ${l.cabinet.referrals} ${referralsCount}
` +
        `🛍️ ${l.cabinet.ordersCount} 0

` +
        `🔗 ${l.cabinet.yourReferralLink}
` +
        `\`${referralLink}\`

` +
        l.cabinet.copyLinkText;

    await ctx.editMessageCaption(referralText, {
        reply_markup: keyboard,
        parse_mode: 'Markdown'
    });

    await loggerMiddleware.logUserAction(userId, 'referral_program_viewed');
    if (slideshowStopped) {
        await safeAnswerCbQuery(ctx, l.slideshow.stopped);
    } else {
        await safeAnswerCbQuery(ctx);
    }
}

async function handleOrders(ctx: Context) {
    if (!ctx.from) return;
    
    const userId = ctx.from.id;
    const user = await userService.getUserById(userId);
    if (!user) return;
    
    const l = localization(user.language);
    const slideshowStopped = stopSlideshowForUser(userId.toString());
    const keyboard = {
        inline_keyboard: [
            [{ text: l.buttons.back, callback_data: 'cabinet' }]
        ]
    };
    
    const ordersText = `${l.orders.title}${l.orders.empty}`;
    
    await ctx.editMessageCaption(ordersText, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
    
    await loggerMiddleware.logUserAction(userId, 'orders_viewed');
    if (slideshowStopped) {
        await safeAnswerCbQuery(ctx, l.slideshow.stopped);
    } else {
        await safeAnswerCbQuery(ctx);
    }
}

async function handleWithdraw(ctx: Context) {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    const user = await userService.getUserById(userId);
    if (!user) return;
    
    const l = localization(user.language);
    const slideshowStopped = stopSlideshowForUser(userId.toString());
    
    const keyboard = {
        inline_keyboard: [
            [{ text: l.buttons.back, callback_data: 'cabinet' }]
        ]
    };
    
    const withdrawText = `💸 Вывод средств

Ваш баланс: ${user.balanceUSDT}$

Выберите способ вывода:`;
    
    await ctx.editMessageCaption(withdrawText, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
    
    await loggerMiddleware.logUserAction(userId, 'withdraw_viewed');
    if (slideshowStopped) {
        await ctx.answerCbQuery(l.slideshow.stopped);
    } else {
        await ctx.answerCbQuery();
    }
}

async function handleRefresh(ctx: Context) {
    try {
        if (!ctx.from) {
            errorHandler.logError('handleRefresh: ctx.from is missing');
            return;
        }
        const userId = ctx.from.id;

        // await userService.toggleReferralPercent(userId);

        const user = await userService.getUserById(userId);
        if (!user) {
            errorHandler.logError(`handleRefresh: User ${userId} not found`);
            await loggerMiddleware.logUserAction(userId, 'refresh_error', { error: 'user_not_found' });
            // Отправляем уведомление об ошибке, если юзер не найден
            await ctx.answerCbQuery('User not found.', { show_alert: true });
            return;
        }

        // Используем текст напрямую, чтобы избежать проблем с локализацией
        const notificationText = user.language === 'ru' ? 'Профиль обновлен! ✅' : 'Profile updated! ✅';
        
        // 3. Отправляем всплывающее уведомление БЕЗ редактирования сообщения
        await ctx.answerCbQuery(notificationText, { show_alert: false });

        // 4. Обновляем сообщение в кабинете, чтобы отобразить новые данные
        await handleCabinet(ctx);
        
        await loggerMiddleware.logUserAction(userId, 'profile_refreshed');

    } catch (error) {
        // Логируем любую критическую ошибку внутри функции
        errorHandler.handleBotError(error instanceof Error ? error : new Error(String(error)), ctx, 'handleRefresh');
        if (ctx.from?.id) {
            await loggerMiddleware.logUserAction(ctx.from.id, 'refresh_critical_error', { error: error instanceof Error ? error.message : String(error) });
        }
    }
}
