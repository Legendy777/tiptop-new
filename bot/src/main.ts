import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import { InlineQueryResultArticle } from 'telegraf/typings/core/types/typegram';
import { handleStart, showMainMenu } from './handlers/start.handler';
import { handleCallbackQuery } from './handlers/callback.handler';
import { localization, SUPPORT_URL, PLACEHOLDER_IMAGE_URL, DEFAULT_GOOGLE_PLAY_URL, DEFAULT_APP_STORE_URL, WEB_APP_URL, BOT_URL } from './config/localization';
import { NotificationService } from './utils/notifications';

// 🔧 Новые сервисы и middleware
import { configService } from './config/config.service';
import { errorHandler } from './utils/errorHandler';
import { rateLimitMiddleware } from './middleware/rateLimiter';
import { userMiddleware } from './middleware/userMiddleware';
import { loggingMiddleware, loggerMiddleware } from './middleware/logger';
import {userService} from "./services/user.service";
import {gameService} from "./services/game.service";

// 🚀 Инициализация с валидацией конфигурации
try {
  configService.validateForProduction();
  errorHandler.logInfo('✅ Конфигурация валидирована успешно');
} catch (error) {
  console.error('❌ Ошибка валидации конфигурации:', error);
  process.exit(1);
}

export const bot = new Telegraf(configService.get<string>('bot.token'));
const notificationService = new NotificationService(bot);

// 🔧 Инициализируем NotificationService в ErrorHandler
errorHandler.setNotificationService(notificationService);

// 🛡️ Подключаем middleware
bot.use(loggingMiddleware); // Логирование должно быть первым
bot.use(userMiddleware);
bot.use(rateLimitMiddleware); // Rate limiting вторым

// Обработчик команды /start
bot.start((ctx) => handleStart(ctx, notificationService));

// Обработчик callback-запросов
bot.on('callback_query', handleCallbackQuery);

// Обработчик текстовых сообщений (только для команд с постоянной клавиатуры)
bot.on('text', async (ctx) => {
  try {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;
    
    const userId = ctx.from.id.toString();
    const messageText = ctx.message.text;
    
    // Получаем пользователя
    const user = await userService.getUserById(Number(userId));
    const language = user?.language || 'ru';
    const l = localization(language);
    
    // Обработка только команд с постоянной клавиатуры
    if (messageText === l.buttons.menu) {
      await showMainMenu(ctx, false);
      return;
    }
    
    if (messageText === l.buttons.support) {
      const keyboard = {
        inline_keyboard: [
          [{ text: l.buttons.supportChat, url: configService.get<string>('channels.supportUrl') }],
          [{ text: l.buttons.back, callback_data: 'back_to_menu' }]
        ]
      };
      
      await ctx.replyWithHTML(l.pages.support, {
        reply_markup: keyboard
      });
      return;
    }

    const webAppUrl = configService.get<string>('webApp.url');
    ctx.reply(l.buttons.reply, Markup.inlineKeyboard([
      Markup.button.webApp(l.buttons.supportChat, webAppUrl + '/chat')
    ]));
    
  } catch (error) {
    await errorHandler.handleBotError(
      error instanceof Error ? error : new Error(String(error)),
      ctx,
      'text_handler'
    );
  }
});

// Обработчик inline-запросов
bot.on('inline_query', async (ctx) => {
  try {
    if (!ctx.from || !ctx.inlineQuery) return;

    const userId = ctx.from.id.toString();
    const user = await userService.getUserById(Number(userId));
    const language = user?.language || 'ru';
    const l = localization(language);
    const input = ctx.inlineQuery.query || ''; // Получаем строку ввода из запроса
    const offset = parseInt(ctx.inlineQuery.offset, 10) || 0;

    console.log(`📝 Inline query: "${input}" from user ${userId}`);

    // 1. Получаем все игры из базы данных
    const allGames = await gameService.getEnabledGames(); // Получаем все игры
    console.log(`🎮 Total games: ${allGames.length}`);

    // 2. Фильтруем игры по введенному тексту
    const filteredGames = allGames.filter((game) =>
      game.title.toLowerCase().includes(input.toLowerCase()),
    );
    console.log(`🔍 Filtered games: ${filteredGames.length}`);

    // 3. Применяем пагинацию
    const nextResults = filteredGames.slice(offset, offset + 50);

    // 4. Преобразуем в формат для Telegram
    const inlineResults: InlineQueryResultArticle[] = nextResults.map((game) => {
      // Используем GIF если есть, иначе обычную картинку
      const mediaUrl = game.gifUrl || game.imageUrl || PLACEHOLDER_IMAGE_URL;
      
      return {
        type: 'article' as const,
        id: game.id.toString(),
        title: game.title,
        thumb_url: game.imageUrl || PLACEHOLDER_IMAGE_URL,
        thumb_width: 300,
        thumb_height: 300,
        input_message_content: {
          message_text: `<b>${game.title}</b><a href='${mediaUrl}'>&#8203;</a>`,
          parse_mode: 'HTML' as const,
        },
        reply_markup: {
        inline_keyboard: [
          [
            {
              text: l.inline.playMarket,
              url: game.googlePlayUrl || DEFAULT_GOOGLE_PLAY_URL,
            },
            {
              text: l.inline.appStore,
              url: game.appStoreUrl || DEFAULT_APP_STORE_URL,
            },
          ],
          [
            { text: l.inline.store, url: `https://t.me/${configService.getString('BOT_USERNAME', 'TipTop999_bot')}/Games` },
            { text: l.inline.bot, url: BOT_URL },
          ],
        ],
        },
      };
    });

    // 5. Рассчитываем следующий offset
    const nextOffset =
      offset + 50 < filteredGames.length ? String(offset + 50) : '';

    // 6. Отправляем ответ без реферальных параметров
    await ctx.answerInlineQuery(inlineResults, {
      next_offset: nextOffset,
      button: {
        text: l.buttons.goToBot,
        start_parameter: 'inline_share'
      },
    });

    console.log(`✅ Sent ${inlineResults.length} inline results`);
  } catch (error) {
    await errorHandler.handleBotError(
      error instanceof Error ? error : new Error(String(error)),
      ctx,
      'inline_query_handler'
    );
    await ctx.answerInlineQuery([]);
  }
});

// 🚨 Обработчик ошибок с использованием ErrorHandler
bot.catch(async (err, ctx) => {
  const error = err instanceof Error ? err : new Error(String(err));
  await errorHandler.handleBotError(error, ctx, 'bot_catch');
});

// 🚀 Запуск бота
errorHandler.logInfo('🚀 Инициализация бота...');
errorHandler.logInfo(`🔑 Токен: ${configService.get<string>('bot.token') ? 'Установлен' : 'Отсутствует'}`);
errorHandler.logInfo(`👤 Username: ${configService.get<string>('bot.username')}`);
errorHandler.logInfo(`🛡️ Rate Limit: ${configService.get<number>('security.rateLimitMaxRequests')} запросов/${configService.get<number>('security.rateLimitWindowMs')/1000}с`);
errorHandler.logInfo(`📊 Логирование: ${configService.get<string>('logging.level')} уровень`);

bot.launch()
  .then(async () => {
    errorHandler.logInfo('✅ Бот успешно запущен и готов к работе!');
    errorHandler.logInfo(`📱 Bot username: @${configService.get<string>('bot.username')}`);
    errorHandler.logInfo('🎮 Мок-данные загружены:');
    // errorHandler.logInfo(`   👥 Пользователей: ${mockDatabaseService.getAllUsers().length}`);
    const enabledGames = await gameService.getEnabledGames();
    errorHandler.logInfo(`   🎯 Игр: ${enabledGames.length}`);
    errorHandler.logInfo('🔄 Ожидание сообщений...');
    
    // Логируем статистику middleware
    await loggerMiddleware.logSystemEvent('bot_started', {
      // usersCount: mockDatabaseService.getAllUsers().length,
      gamesCount: enabledGames.length,
      config: {
        rateLimit: configService.get('security'),
        logging: configService.get('logging'),
      }
    });

    // 🔗 Устанавливаем глобальную кнопку меню «Магазин» программно
    try {
      const l = localization(configService.get<string>('localization.defaultLanguage'));
      const webAppUrl = configService.get<string>('webApp.url');
      // Сначала сбрасываем глобальную кнопку меню, затем устанавливаем заново
      try { await bot.telegram.deleteChatMenuButton(); } catch (e) { /* ignore */ }
      await bot.telegram.setChatMenuButton(undefined, {
        type: 'web_app',
        text: l.buttons.store,
        web_app: { url: webAppUrl },
      } as any);
      errorHandler.logInfo(`🧭 Глобальная кнопка меню установлена: ${webAppUrl}`);
      const currentMenu = await bot.telegram.getChatMenuButton();
      errorHandler.logInfo(`📋 Текущая конфигурация кнопки меню: ${JSON.stringify(currentMenu)}`);
    } catch (e) {
      errorHandler.logWarning('Не удалось установить глобальную кнопку меню', e);
    }
  })
  .catch(async (error) => {
    errorHandler.logWarning('❌ Ошибка запуска бота:', error);
    
    let errorDetails = '';
    if (error.message.includes('404')) {
      errorDetails = '❌ Неверный токен бота. Проверьте переменную BOT_TOKEN в .env файле.\n💡 Получить токен можно у @BotFather в Telegram.';
    } else if (error.message.includes('401')) {
      errorDetails = '❌ Неавторизованный доступ. Проверьте токен бота.';
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      errorDetails = '❌ Проблема с сетевым подключением к Telegram API.';
    }
    
    errorHandler.logWarning(errorDetails);
    
    // Логируем критическую ошибку запуска
    await loggerMiddleware.logSystemEvent('bot_startup_failed', {
      error: error.message,
      stack: error.stack,
      details: errorDetails
    }, 'error');
    
    process.exit(1);
  });

// 🔄 Graceful shutdown обрабатывается ErrorHandler автоматически
// Дополнительная обработка для бота
process.once('SIGINT', async () => {
  errorHandler.logInfo('\n🛑 Получен сигнал SIGINT. Останавливаем бота...');
  await loggerMiddleware.logSystemEvent('bot_shutdown', { signal: 'SIGINT' });
  bot.stop('SIGINT');
});

process.once('SIGTERM', async () => {
  errorHandler.logInfo('\n🛑 Получен сигнал SIGTERM. Останавливаем бота...');
  await loggerMiddleware.logSystemEvent('bot_shutdown', { signal: 'SIGTERM' });
  bot.stop('SIGTERM');
});
