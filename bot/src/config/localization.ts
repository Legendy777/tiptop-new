// ============================================================================
// 🌐 СИСТЕМА ЛОКАЛИЗАЦИИ TELEGRAM БОТА
// ============================================================================
// Централизованная система управления текстами, кнопками и сообщениями
// для многоязычного Telegram бота с игровым контентом

// ============================================================================
// 📱 МЕДИА-РЕСУРСЫ
// ============================================================================

// 🎬 GIF анимации для интерфейса
const MEDIA_RESOURCES = {
  gifs: {
    welcome: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    loading: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    success: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
  },
} as const;

// 🎯 Константы для GIF и изображений
const WELCOME_GIFS = {
  ru: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHppdWQzb3MxbzNndjhlZTFiMHpwYnI3Z2l0dGp4czc4dGppZGJiYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NjCzN2GiZFlLjgHJO4/giphy.gif',
  en: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHppdWQzb3MxbzNndjhlZTFiMHpwYnI3Z2l0dGp4czc4dGppZGJiYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NjCzN2GiZFlLjgHJO4/giphy.gif',
} as const;

const SUBSCRIBE_REQUEST_GIF =
  'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif';
const DEFAULT_GIF_URL =
  'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif';
const CABINET_GIF_URL =
  'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif';
const PLACEHOLDER_IMAGE_URL =
  'https://via.placeholder.com/800x400?text=Game+Not+Available';

// ============================================================================
// 🔗 URL-КОНСТАНТЫ
// ============================================================================

// 📱 Ссылки на магазины приложений и каналы
const URL_CONSTANTS = {
  stores: {
    googlePlay: 'https://play.google.com/store/apps/details?id=com.example.app',
    appStore: 'https://apps.apple.com/app/id123456789',
  },
  social: {
    telegramChannel: 'https://t.me/GameCatalogChannel',
    supportBot: 'https://t.me/support_bot',
  },
  SUPPORT_URL: 'https://t.me/tiptop_support',
  CATALOG_URL: 'https://t.me/mobile_games_tp',
} as const;

// 🔗 Дополнительные URL константы
export const SUPPORT_URL = 'https://t.me/tiptop_support';
export const WEB_APP_URL = 'https://tiptop.spb.ru';
export const CHANNEL_URL = 'https://t.me/tiptop_mgn';
export const CATALOG_URL = 'https://t.me/mobile_games_tp';
export const BOT_URL = 'https://t.me/TipTop999_bot';
export const DEFAULT_GOOGLE_PLAY_URL = 'https://play.google.com';
export const DEFAULT_APP_STORE_URL = 'https://www.apple.com/app-store/';

// Дублирующиеся константы удалены - используются из секции выше

// ============================================================================
// 🎮 ИГРОВОЙ КОНТЕНТ
// ============================================================================

// 🏷️ Категории игр с эмодзи
const GAME_CATEGORIES = {
  ru: {
    action: '⚔️ Экшен',
    adventure: '🗺️ Приключения',
    puzzle: '🧩 Головоломки',
    strategy: '🏰 Стратегии',
    racing: '🏎️ Гонки',
    sports: '⚽ Спорт',
    simulation: '🏗️ Симуляторы',
    rpg: '🐉 RPG',
  },
  en: {
    action: '⚔️ Action',
    adventure: '🗺️ Adventure',
    puzzle: '🧩 Puzzle',
    strategy: '🏰 Strategy',
    racing: '🏎️ Racing',
    sports: '⚽ Sports',
    simulation: '🏗️ Simulation',
    rpg: '🐉 RPG',
  },
} as const;

// 🎯 Баннеры игр
const GAME_BANNERS = {
  fallback: {
    title: 'Игра недоступна',
    description: 'Попробуйте позже',
    image: 'https://via.placeholder.com/800x400?text=Game+Not+Available',
  },
} as const;

// ============================================================================
// 🏗️ ИНТЕРФЕЙС ЛОКАЛИЗАЦИИ
// ============================================================================

export interface Localization {
  // ============================================================================
  // 🎯 ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС (ПРИОРИТЕТ)
  // ============================================================================

  // 🔘 КНОПКИ И НАВИГАЦИЯ
  buttons: {
    // Главное меню
    store: string;
    catalog: string;
    news: string;
    cabinet: string;
    about: string;
    support: string;
    reviews: string;
    share: string;
    language: string;
    back: string;
    menu: string;

    // Подписка
    subscribeToChannel: string;
    checkSubscription: string;
    subscribe: string;

    // Операции
    orders: string;
    refresh: string;
    deposit: string;
    withdraw: string;
    chat: string;
    referralProgram: string;
    update: string;

    // Магазины
    googlePlay: string;
    appStore: string;

    // Медиа
    trailer: string;

    // Навигация
    ourBot: string;
    prev: string;
    next: string;
    play: string;
    stop: string;

    reply: string;

    // Поддержка
    contactSupport: string;
    supportChat: string;
    goToBot: string;
  };

  // 😀 ЭМОДЗИ И ИКОНКИ
  emojis: {
    game: {
      default: string;
      controller: string;
      mobile: string;
    };
    fire: string;
  };

  // 🎮 ОСНОВНЫЕ ИГРОВЫЕ ЭЛЕМЕНТЫ
  core: {
    discount: string;
    tapToPlay: string;
  };

  // 💬 ОСНОВНЫЕ СООБЩЕНИЯ
  messages: {
    welcome: string;
    languageSelected: string;
    echo: string;
    echoResponse: string;
  };

  // 📢 ПОДПИСКА И УВЕДОМЛЕНИЯ
  subscription: {
    request: string;
    success: string;
    failed: string;
  };

  notifications: {
    purchase: string;
    deposit: string;
    supportReply: string;
    newReferral: string;
  };

  // 📄 КОНТЕНТНЫЕ СТРАНИЦЫ
  pages: {
    about: string;
    support: string;
    reviews: string;
  };

  // ❌ ПОЛЬЗОВАТЕЛЬСКИЕ ОШИБКИ
  errors: {
    general: string;
    userBlocked: string;
    noGames: string;
    startError: string;
  };

  // 🔍 INLINE ФУНКЦИИ
  inline: {
    playMarket: string;
    appStore: string;
    store: string;
    bot: string;
  };

  // 👤 ЛИЧНЫЙ КАБИНЕТ
  cabinet: {
    title: string;
    user: string;
    userInfo: string;
    id: string;
    orders: string;
    ordersCount: string;
    percent: string;
    referrals: string;
    balance: string;
    currency: string;
    earnings: string;
    link: string;
    language: string;
    referralProgram: string;
    referralPercent: string;
    yourReferralLink: string;
    backButton: string;
    referralPurchases: string;
    backToMenu: string;
    defaultUsername: string;
    copyLinkText: string;
  };

  // 📦 ЗАКАЗЫ
  orders: {
    title: string;
    empty: string;
  };

  // 🎬 СЛАЙДШОУ
  slideshow: {
      started: string;
      stopped: string;
      stoppedManual: string;
      stoppedTimer: string;
      alreadyPlaying: string;
    };

  // ============================================================================
  // ⚙️ СИСТЕМНЫЕ ЭЛЕМЕНТЫ (НИЗКИЙ ПРИОРИТЕТ)
  // ============================================================================

  // 🔧 СИСТЕМНЫЕ НАСТРОЙКИ
  system: {
    languageSelection: string;
    botName: string;
    defaultGame: string;
  };

  // 📊 ЛОГИ И ОТЛАДКА
  logs: {
    // База данных
    channelNotSet: string;
    noGamesInDatabase: string;
    noValidGamesInDatabase: string;
    currentGameUndefined: string;

    // Интерфейс
    sendingNewMainMenu: string;
    bannerNoMessageId: string;
    bannerUnknownAction: string;

    // Контекст
    invalidContext: string;
    errorEditingMessage: string;
    errorSendingFallback: string;
    fallbackMessageFailed: string;

    // Главное меню
    errorInShowMainMenu: string;
    errorEditingMedia: string;
    errorEditingCaption: string;
    errorSendingEditingMessage: string;

    // Обработчики
    errorInHandleAbout: string;
    errorInHandleSupport: string;
    errorInHandleReviews: string;
    errorInHandleStart: string;
    errorInHandleLanguageChange: string;

    // Критические
    startCommandFailed: string;
    criticalChannelNotSet: string;
    couldNotDeleteMessage: string;
    noMessageIdForSubscription: string;
    missingUserIdOrChatId: string;
    botTokenNotFound: string;

    // Общие
    unknownAction: string;
    actionFailed: string;
  };
}

// ============================================================================
// 🌍 РЕАЛИЗАЦИЯ ЛОКАЛИЗАЦИЙ
// ============================================================================

const localizations: Record<string, Localization> = {
  // 🇷🇺 РУССКАЯ ЛОКАЛИЗАЦИЯ
  ru: {
    // 🔘 КНОПКИ И НАВИГАЦИЯ
    buttons: {
      // Главное меню
      store: '🛍️ Магазин',
      catalog: '📂 Каталог',
      news: '📱 Новости',
      cabinet: '🧙‍♀️ Профиль',
      about: '❗ О нас',
      support: '👨‍💻 Поддержка',
      reviews: '✅ Отзывы',
      share: '🚀 Поделиться',
      language: '🇷🇺 Русский',
      back: '⬅️ Назад',
      menu: '📱 Меню',

      // Подписка
      subscribeToChannel: '📢 Подписаться на канал',
      checkSubscription: '✅ Проверить подписку',
      subscribe: '📢 Подписаться',

      // Операции
      orders: '📦 Заказы',
      refresh: '🔄 Обновить',
      deposit: '💳 Пополнить USDT',
      withdraw: '💸 Вывести',
      chat: '💬 Чат',
      referralProgram: '🤝 Реф. программа',
      update: '🔄 Обновить',

      // Магазины
      googlePlay: '🤖 Google Play',
      appStore: '🍎 App Store',

      // Медиа
      trailer: '🎬 Трейлер',

      // Навигация
      ourBot: '🤖 Бот',
      prev: '⏮',
      next: '⏭',
      play: '▶️',
      stop: '⏹',

      reply: 'Общение только в чате',

      // Поддержка
      contactSupport: '📞 Связаться с поддержкой',
      supportChat: '💬 Чат поддержки',
      goToBot: '🤖 Перейти к боту',
    },

    // 😀 ЭМОДЗИ И ИКОНКИ
    emojis: {
      game: {
        default: '🎮',
        controller: '🎮',
        mobile: '📱',
      },
      fire: '🔥',
    },

    // 🎮 ОСНОВНЫЕ ИГРОВЫЕ ЭЛЕМЕНТЫ
    core: {
      discount: 'Скидка!',
      tapToPlay: '👆 Нажмите, чтобы играть',
    },

    // 💬 ОСНОВНЫЕ СООБЩЕНИЯ
    messages: {
      welcome: 'Добро пожаловать!',
      languageSelected: '🇷🇺 Выбран русский язык. Добро пожаловать!',
      echo: 'Я бот и не могу обработать это сообщение. Если у вас есть вопросы, обратитесь к нашему оператору в чате.👇',
      echoResponse:
        'Я бот и не могу обработать это сообщение. Если у вас есть вопросы, обратитесь к нашему оператору в чате.👇',
    },

    // 📢 ПОДПИСКА И УВЕДОМЛЕНИЯ
    subscription: {
      request: '📢 Для использования бота необходимо подписаться на наш канал!',
      success: '✅ Отлично! Подписка подтверждена!',
      failed: '❌ Подписка не найдена. Пожалуйста, подпишитесь.',
    },

    notifications: {
      purchase: '🛒 Новый заказ успешно оформлен!',
      deposit: '💰 Баланс пополнен на {amount} $!',
      supportReply: '📩 Поддержка ответила на ваш запрос!',
      newReferral: '👥 У вас новый реферал: {username}!',
    },

    // 📄 КОНТЕНТНЫЕ СТРАНИЦЫ
    pages: {
      about:
        'ℹ️ О нас\n\nМы — платформа мобильных игр. Наша цель — предоставить вам лучшие игры и удобный сервис.',
      support:
        '🆘 Поддержка\n\nЕсли у вас есть вопросы или проблемы, обратитесь к нам.',
      reviews: '⭐ Отзывы\n\nВаши отзывы помогают нам становиться лучше!',
    },

    // ❌ ПОЛЬЗОВАТЕЛЬСКИЕ ОШИБКИ
    errors: {
      general: '❌ Произошла ошибка. Попробуйте позже.',
      userBlocked: '⛔ Вы заблокированы. Доступ к боту ограничен.',
      noGames: '📛 Игры не загружены. Добавьте хотя бы одну игру.',
      startError: 'Произошла ошибка при запуске. Попробуйте позже.',
    },

    // 🔍 INLINE ФУНКЦИИ
    inline: {
      playMarket: '🤖 Play Market',
      appStore: '🍎 App Store',
      store: '🛍 Магазин',
      bot: '🤖 Бот',
    },

    // 👤 ЛИЧНЫЙ КАБИНЕТ
    cabinet: {
      title: '👤 Профиль',
      user: 'Пользователь:',
      userInfo: '👤 Информация о пользователе',
      id: 'ID:',
      orders: 'Количество заказов:',
      ordersCount: 'Ваши Покупки:',
      percent: 'Процент с рефералов:',
      referrals: 'Рефералы:',
      balance: 'Баланс:',
      currency: 'РУБ',
      earnings: 'Заработок:',
      link: 'Ваша реферальная ссылка:',
      language: 'Язык:',
      referralProgram: 'Реферальная программа:',
      referralPercent: 'Процент с рефералов:',
      yourReferralLink: 'Ваша реферальная ссылка:',
      backButton: '⬅️ Назад в меню',
      referralPurchases: 'Покупки рефералов:',
      backToMenu: '⬅️ Назад',
      defaultUsername: 'Пользователь',
      copyLinkText: '📋 Нажмите на ссылку выше, чтобы скопировать',
    },

    // 📦 ЗАКАЗЫ
    orders: {
      title: '📜 Ваши заказы:\n\n',
      empty: 'У вас пока нет заказов.',
    },

    // 🎬 СЛАЙДШОУ
    slideshow: {
      started: '▶️ Автопрокрутка запущена',
      stopped: '⏹️ Автопрокрутка остановлена',
      stoppedManual: '⏹️ Автопрокрутка остановлена',
      stoppedTimer: '⏰ Автопрокрутка завершена по таймеру',
      alreadyPlaying: '⚠️ Автопрокрутка уже запущена',
    },

    // ⚙️ СИСТЕМНЫЕ НАСТРОЙКИ
    system: {
      languageSelection: '🌐 Выберите язык / Select language',
      botName: 'Tiptop_dev_bot',
      defaultGame: 'Default Game',
    },

    // 📊 ЛОГИ И ОТЛАДКА
    logs: {
      channelNotSet:
        'CHANNEL_TG is not set in the .env file for subscription check.',
      noGamesInDatabase: 'No games found in database for banners',
      noValidGamesInDatabase: 'No valid games found in database for banners',
      currentGameUndefined: 'Current game is undefined or has no title. Index:',
      sendingNewMainMenu:
        "Sending new main menu because 'editMessage' is false (messageId:",
      bannerNoMessageId: '[BANNER] No messageId found for user',
      bannerUnknownAction: '[BANNER] Unknown action',
      invalidContext: 'handleCabinet: Invalid context',
      errorEditingMessage: 'Error editing message in',
      errorSendingFallback: 'Error sending fallback game in showMainMenu:',
      fallbackMessageFailed: 'Fallback message failed for user',
      errorInShowMainMenu: 'Error in showMainMenu:',
      errorEditingMedia: 'Error editing media in showMainMenu:',
      errorEditingCaption: 'Error editing caption in showMainMenu:',
      errorSendingEditingMessage:
        'Error in showMainMenu sending/editing message:',
      errorInHandleAbout: 'Error editing message in handleAbout:',
      errorInHandleSupport: 'Error editing message in handleSupport:',
      errorInHandleReviews: 'Error editing message in handleReviews:',
      errorInHandleStart: 'Error in handleStart:',
      errorInHandleLanguageChange: 'Error in handleLanguageChange:',
      startCommandFailed: 'Start command failed',
      criticalChannelNotSet:
        'CRITICAL: CHANNEL_TG is not set in the .env file! Subscription checks will fail.',
      couldNotDeleteMessage: 'Could not delete message on /start:',
      noMessageIdForSubscription:
        'No messageId found for check subscription, showing language selection.',
      missingUserIdOrChatId:
        'Missing userId or chatId in editOrSendCabinetMessage',
      botTokenNotFound: 'BOT_TOKEN не найден в переменных окружения',
      unknownAction: 'Unknown action:',
      actionFailed: 'Action failed',
    },
  },

  // 🇬🇧 АНГЛИЙСКАЯ ЛОКАЛИЗАЦИЯ
  en: {
    // 🔘 КНОПКИ И НАВИГАЦИЯ
    buttons: {
      // Главное меню
      store: '🛍️ Store',
      catalog: '📂 Catalog',
      news: '📱 News',
      cabinet: '🧙‍♀️ Profile',
      about: '❗ About Us',
      support: '👨‍💻 Support',
      reviews: '✅ Reviews',
      share: '🚀 Share',
      language: '🇬🇧 English',
      back: '⬅️ Back',
      menu: '📱 Menu',

      // Подписка
      subscribeToChannel: '📢 Subscribe to Channel',
      checkSubscription: '✅ Check Subscription',
      subscribe: '📢 Subscribe',

      // Операции
      orders: '📦 Orders',
      refresh: '🔄 Update',
      deposit: '💳 Deposit USDT',
      withdraw: '💸 Withdraw',
      chat: '💬 Chat',
      referralProgram: '🤝 Ref. program',
      update: '🔄 Update',

      // Магазины
      googlePlay: '🤖 Google Play',
      appStore: '🍎 App Store',

      // Медиа
      trailer: '🎬 Trailer',

      // Навигация
      ourBot: '🤖 Bot',
      prev: '⏮',
      next: '⏭',
      play: '▶️',
      stop: '⏹',

      reply: 'Communication only in chat',

      // Поддержка
      contactSupport: '📞 Contact Support',
      supportChat: '💬 Support Chat',
      goToBot: '🤖 Go to Bot',
    },

    // 😀 ЭМОДЗИ И ИКОНКИ
    emojis: {
      game: {
        default: '🎮',
        controller: '🎮',
        mobile: '📱',
      },
      fire: '🔥',
    },

    // 🎮 ОСНОВНЫЕ ИГРОВЫЕ ЭЛЕМЕНТЫ
    core: {
      discount: 'Discount!',
      tapToPlay: '👆 Tap to play',
    },

    // 💬 ОСНОВНЫЕ СООБЩЕНИЯ
    messages: {
      welcome: 'Welcome!',
      languageSelected: '🇬🇧 English language selected. Welcome!',
      echo: "I'm a bot and I can't process this message. If you have any questions, ask our operator in the chat.👇",
      echoResponse:
        "I'm a bot and I can't process this message. If you have any questions, ask our operator in the chat.👇",
    },

    // 📢 ПОДПИСКА И УВЕДОМЛЕНИЯ
    subscription: {
      request: '📢 You need to subscribe to our channel to use this bot!',
      success: '✅ Great! Subscription confirmed!',
      failed: '❌ Subscription not found. Please subscribe.',
    },

    notifications: {
      purchase: '🛒 New order successfully placed!',
      deposit: '💰 Balance topped up by {amount} $!',
      supportReply: '📩 Support has replied to your request!',
      newReferral: '👥 You have a new referral: {username}!',
    },

    // 📄 КОНТЕНТНЫЕ СТРАНИЦЫ
    pages: {
      about:
        'ℹ️ About Us\n\nWe are a mobile gaming platform. Our goal is to provide you with the best games and convenient service.',
      support: '🆘 Support\n\nIf you have any questions or issues, contact us.',
      reviews: '⭐ Reviews\n\nYour feedback helps us improve!',
    },

    // ❌ ПОЛЬЗОВАТЕЛЬСКИЕ ОШИБКИ
    errors: {
      general: '❌ An error occurred. Please try again later.',
      userBlocked: '⛔ You are blocked. Access to the bot is restricted.',
      noGames: '📛 Games are not loaded. Please add at least one game.',
      startError: 'An error occurred on startup. Please try again later.',
    },

    // 🔍 INLINE ФУНКЦИИ
    inline: {
      playMarket: '🤖 Play Market',
      appStore: '🍎 App Store',
      store: '🛍 Store',
      bot: '🤖 Bot',
    },

    // 👤 ЛИЧНЫЙ КАБИНЕТ
    cabinet: {
      title: '👤 Profile',
      user: 'User:',
      userInfo: '👤 User Information',
      id: 'ID:',
      orders: 'Your purchases:',
      ordersCount: 'Purchases from referrals:',
      percent: 'Referral percent:',
      referrals: 'Referrals:',
      balance: 'Balance:',
      currency: 'RUB',
      earnings: 'Earnings:',
      link: 'Your referral link:',
      language: 'Language:',
      referralProgram: 'Referral program:',
      referralPercent: 'Referral percent:',
      yourReferralLink: 'Your referral link:',
      backButton: '⬅️ Back to Menu',
      referralPurchases: 'Referral Purchases:',
      backToMenu: '⬅️ Back',
      defaultUsername: 'User',
      copyLinkText: '📋 Tap the link above to copy',
    },

    // 📦 ЗАКАЗЫ
    orders: {
      title: '📜 Your Orders:\n\n',
      empty: 'You have no orders yet.',
    },

    // 🎬 СЛАЙДШОУ
    slideshow: {
      started: '▶️ Slideshow started',
      stopped: '⏹️ Slideshow stopped',
      stoppedManual: '⏹️ Slideshow stopped',
      stoppedTimer: '⏰ Slideshow finished by timer',
      alreadyPlaying: '⚠️ Slideshow already playing',
    },

    // ⚙️ СИСТЕМНЫЕ НАСТРОЙКИ
    system: {
      languageSelection: '🌐 Выберите язык / Select language',
      botName: 'Tiptop_dev_bot',
      defaultGame: 'Default Game',
    },

    // 📊 ЛОГИ И ОТЛАДКА
    logs: {
      channelNotSet:
        'CHANNEL_TG is not set in the .env file for subscription check.',
      noGamesInDatabase: 'No games found in database for banners',
      noValidGamesInDatabase: 'No valid games found in database for banners',
      currentGameUndefined: 'Current game is undefined or has no title. Index:',
      sendingNewMainMenu:
        "Sending new main menu because 'editMessage' is false (messageId:",
      bannerNoMessageId: '[BANNER] No messageId found for user',
      bannerUnknownAction: '[BANNER] Unknown action',
      invalidContext: 'handleCabinet: Invalid context',
      errorEditingMessage: 'Error editing message in',
      errorSendingFallback: 'Error sending fallback game in showMainMenu:',
      fallbackMessageFailed: 'Fallback message failed for user',
      errorInShowMainMenu: 'Error in showMainMenu:',
      errorEditingMedia: 'Error editing media in showMainMenu:',
      errorEditingCaption: 'Error editing caption in showMainMenu:',
      errorSendingEditingMessage:
        'Error in showMainMenu sending/editing message:',
      errorInHandleAbout: 'Error editing message in handleAbout:',
      errorInHandleSupport: 'Error editing message in handleSupport:',
      errorInHandleReviews: 'Error editing message in handleReviews:',
      errorInHandleStart: 'Error in handleStart:',
      errorInHandleLanguageChange: 'Error in handleLanguageChange:',
      startCommandFailed: 'Start command failed',
      criticalChannelNotSet:
        'CRITICAL: CHANNEL_TG is not set in the .env file! Subscription checks will fail.',
      couldNotDeleteMessage: 'Could not delete message on /start:',
      noMessageIdForSubscription:
        'No messageId found for check subscription, showing language selection.',
      missingUserIdOrChatId:
        'Missing userId or chatId in editOrSendCabinetMessage',
      botTokenNotFound: 'BOT_TOKEN not found in environment variables',
      unknownAction: 'Unknown action:',
      actionFailed: 'Action failed',
    },
  },
};

// ============================================================================
// 🛠️ УТИЛИТЫ ЛОКАЛИЗАЦИИ
// ============================================================================

/**
 * Получает локализацию для указанного языка
 * @param lang - Код языка ('ru' | 'en')
 * @returns Объект локализации
 */
export function localization(lang: string = 'ru'): Localization {
  return localizations[lang] || localizations.ru;
}

// ============================================================================
// 📤 ЭКСПОРТЫ
// ============================================================================

// Экспорт констант и объектов
export {
  MEDIA_RESOURCES,
  URL_CONSTANTS,
  GAME_CATEGORIES,
  GAME_BANNERS,
  WELCOME_GIFS,
  SUBSCRIBE_REQUEST_GIF,
  DEFAULT_GIF_URL,
  CABINET_GIF_URL,
  PLACEHOLDER_IMAGE_URL,
  localizations,
};

// Экспорт по умолчанию
export default localizations;
