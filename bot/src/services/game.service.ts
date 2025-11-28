import axios from "axios";
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
    const response = await axios.get(process.env.API_URL + '/games');

    const isEnabledGames = response.data.filter((game: Game) => game.isEnabled);

    return isEnabledGames || null;
  }
}

// Экспортируем экземпляр сервиса
export const gameService = new GameService();
