// import axios from "axios"; // Not needed - using mock data
import {User} from "./user.service";

export interface Game {
  id: number;
  title: string;
  imageUrl: string;
  gifUrl: string;
  hasDiscount: boolean;
  isEnabled: boolean;
  appleStoreUrl?: string;
  appStoreUrl?: string;
  googlePlayUrl: string;
  trailerUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GameService {
  /**
   * Получить все включенные игры
   */
  async getEnabledGames(): Promise<Game[]> {
// Return mock games with mock data
    const mockGames: Game[] = [
      {
        id: 1,
        title: 'Game One',
        imageUrl: 'https://via.placeholder.com/300x300?text=Game+One',
        gifUrl: 'https://via.placeholder.com/300x300?text=GIF+1',
        hasDiscount: false,
        isEnabled: true,
        appleStoreUrl: undefined,
        appStoreUrl: 'https://apps.apple.com',
        googlePlayUrl: 'https://play.google.com',
        trailerUrl: 'https://youtube.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: 'Game Two',
        imageUrl: 'https://via.placeholder.com/300x300?text=Game+Two',
        gifUrl: 'https://via.placeholder.com/300x300?text=GIF+2',
        hasDiscount: true,
        isEnabled: true,
        appleStoreUrl: 'https://apps.apple.com',
        appStoreUrl: 'https://apps.apple.com',
        googlePlayUrl: 'https://play.google.com',
        trailerUrl: 'https://youtube.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    return mockGames;
  }
}

// Экспортируем экземпляр сервиса
export const gameService = new GameService();
