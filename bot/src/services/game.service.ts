export interface Game {
  id: number;
  title: string;
  imageUrl: string;
  gifUrl: string;
  hasDiscount: boolean;
  isActual: boolean;
  isEnabled: boolean;
  appleStoreUrl: string;
  googlePlayUrl: string;
  trailerUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

let prisma: any;
async function getPrismaClient() {
  try {
    if (!prisma) {
      const mod = await import('@prisma/client');
      const { PrismaClient } = mod as any;
      prisma = new PrismaClient();
    }
    return prisma;
  } catch {
    return null;
  }
}

export class GameService {
  /**
   * Получить все включенные игры из базы данных
   */
  async getEnabledGames(): Promise<Game[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return this.getDefaultGames();
      }
      const client = await getPrismaClient();
      if (!client) {
        return this.getDefaultGames();
      }
      const games = await client.game.findMany({
        where: { isEnabled: true, isActual: true },
        orderBy: { createdAt: 'desc' },
      });
      return games && games.length ? games : this.getDefaultGames();
    } catch (error) {
      console.error('Error fetching games from database:', error);
      return this.getDefaultGames();
    }
  }

  /**
   * Получить игры по умолчанию (если БД недоступна)
   */
  private getDefaultGames(): Game[] {
    return [
      {
        id: 1,
        title: '📲 Asphalt Legends - Racing Game',
        imageUrl: 'https://i.ibb.co/BHqtVK4Q/PLmy-Zqt-Hm-PZ.jpg',
        gifUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25iMG9hcXpnamUzMmV3ZWd2cGtqb2F5NGwyajA3a21tb3B1c3c1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LDjKkXTfIPZ7zYOcvq/giphy.gif',
        hasDiscount: true,
        isActual: true,
        isEnabled: true,
        appleStoreUrl: 'https://apps.apple.com/us/app/asphalt-legends-racing-game/id805603214',
        googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.gameloft.android.ANMP.GloftA9HM',
        trailerUrl: 'https://youtu.be/TEuZZB_zSOw',
        createdAt: new Date('2025-05-01'),
        updatedAt: new Date('2025-05-01'),
      },
      {
        id: 2,
        title: '📲 EA SPORTS FC™ Mobile Football',
        imageUrl: 'https://i.ibb.co/8gqJrKMF/Ysdb-Aauqynx.jpg',
        gifUrl: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWdqbGlqNnV3cG9nejc4anNudm5ycXE3bmhkMWhjZnlxejlsejExNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Br5i1DgRrNT9uCvssd/giphy.gif',
        hasDiscount: false,
        isActual: true,
        isEnabled: true,
        appleStoreUrl: 'https://apps.apple.com/us/app/ea-sports-fc-mobile-soccer/id1094930513',
        googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.ea.gp.fifamobile',
        trailerUrl: 'https://youtu.be/TEuZZB_zSOw',
        createdAt: new Date('2025-05-06'),
        updatedAt: new Date('2025-05-06'),
      },
    ];
  }
}

export const gameService = new GameService();
