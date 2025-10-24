/**
 * Менеджер обновлений сообщений для предотвращения конфликтов
 * и обеспечения стабильной работы Telegram бота
 */

interface PendingUpdate {
  timeout: NodeJS.Timeout;
  timestamp: number;
}

class MessageUpdateManager {
  private pendingUpdates: Map<string, PendingUpdate> = new Map();
  private readonly DEBOUNCE_DELAY = 100; // мс
  private readonly MAX_PENDING_TIME = 5000; // мс

  /**
   * Планирует обновление сообщения с дебаунсингом
   * @param key Уникальный ключ для обновления (обычно userId_chatId)
   * @param updateFunction Функция обновления
   */
  scheduleUpdate(key: string, updateFunction: () => Promise<void>): void {
    // Отменяем предыдущее обновление если оно есть
    this.cancelPendingUpdate(key);

    // Создаем новое отложенное обновление
    const timeout = setTimeout(async () => {
      try {
        await updateFunction();
      } catch (error) {
        console.error(`Error in scheduled update for ${key}:`, error);
      } finally {
        this.pendingUpdates.delete(key);
      }
    }, this.DEBOUNCE_DELAY);

    this.pendingUpdates.set(key, {
      timeout,
      timestamp: Date.now()
    });
  }

  /**
   * Отменяет ожидающее обновление
   * @param key Ключ обновления
   */
  cancelPendingUpdate(key: string): void {
    const pending = this.pendingUpdates.get(key);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingUpdates.delete(key);
    }
  }

  /**
   * Проверяет, есть ли ожидающее обновление
   * @param key Ключ обновления
   */
  hasPendingUpdate(key: string): boolean {
    return this.pendingUpdates.has(key);
  }

  /**
   * Очищает устаревшие ожидающие обновления
   */
  cleanupStaleUpdates(): void {
    const now = Date.now();
    for (const [key, pending] of this.pendingUpdates.entries()) {
      if (now - pending.timestamp > this.MAX_PENDING_TIME) {
        clearTimeout(pending.timeout);
        this.pendingUpdates.delete(key);
        console.warn(`Cleaned up stale update for ${key}`);
      }
    }
  }

  /**
   * Получает количество ожидающих обновлений
   */
  getPendingCount(): number {
    return this.pendingUpdates.size;
  }
}

// Экспортируем синглтон
export const messageUpdateManager = new MessageUpdateManager();

// Периодическая очистка устаревших обновлений
setInterval(() => {
  messageUpdateManager.cleanupStaleUpdates();
}, 30000); // каждые 30 секунд