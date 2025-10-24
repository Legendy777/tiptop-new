export {};

declare global {
    interface TelegramWebAppUser {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
    }

    interface TelegramWebApp {
        initData: string;
        initDataUnsafe?: {
            user?: TelegramWebAppUser;
        };
        expand?: () => void;
        ready?: () => void;
        // add other properties if needed
    }

    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}
