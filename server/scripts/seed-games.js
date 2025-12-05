#!/usr/bin/env node

/**
 * Seed скрипт для заполнения БД играми и офферами
 * Запуск: node server/scripts/seed-games.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GAMES_DATA = [
  {
    title: '📲 Asphalt Legends - Racing Game',
    imageUrl: 'https://i.ibb.co/BHqtVK4Q/PLmy-Zqt-Hm-PZ.jpg',
    gifUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25iMG9hcXpnamUzMmV3ZWd2cGtqb2F5NGwyajA3a21tb3B1c3c1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LDjKkXTfIPZ7zYOcvq/giphy.gif',
    hasDiscount: true,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/us/app/asphalt-legends-racing-game/id805603214',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.gameloft.android.ANMP.GloftA9HM',
    trailerUrl: 'https://youtu.be/TEuZZB_zSOw',
    offers: [
      { title: 'Starter Pack', priceRUB: 199, priceUSDT: 2 },
      { title: 'Premium Pack', priceRUB: 499, priceUSDT: 5 },
      { title: 'Ultimate Pack', priceRUB: 999, priceUSDT: 10 },
    ]
  },
  {
    title: '📲 EA SPORTS FC™ Mobile Football',
    imageUrl: 'https://i.ibb.co/8gqJrKMF/Ysdb-Aauqynx.jpg',
    gifUrl: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWdqbGlqNnV3cG9nejc4anNudm5ycXE3bmhkMWhjZnlxejlsejExNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Br5i1DgRrNT9uCvssd/giphy.gif',
    hasDiscount: false,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/us/app/ea-sports-fc-mobile-soccer/id1094930513',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.ea.gp.fifamobile',
    trailerUrl: 'https://youtu.be/TEuZZB_zSOw',
    offers: [
      { title: '1000 FC Points', priceRUB: 299, priceUSDT: 3 },
      { title: '5000 FC Points', priceRUB: 1299, priceUSDT: 13 },
      { title: '12000 FC Points', priceRUB: 2999, priceUSDT: 30 },
    ]
  },
  {
    title: '📲 PUBG Mobile',
    imageUrl: 'https://via.placeholder.com/800x400?text=PUBG+Mobile',
    gifUrl: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
    hasDiscount: true,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/app/pubg-mobile/id1330123889',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.tencent.ig',
    trailerUrl: 'https://www.youtube.com/watch?v=sH3p6VbgHs8',
    offers: [
      { title: '60 UC', priceRUB: 99, priceUSDT: 1 },
      { title: '325 UC', priceRUB: 499, priceUSDT: 5 },
      { title: '660 UC', priceRUB: 999, priceUSDT: 10 },
      { title: 'Royal Pass', priceRUB: 799, priceUSDT: 8 },
    ]
  },
  {
    title: '📲 Clash of Clans',
    imageUrl: 'https://via.placeholder.com/800x400?text=Clash+of+Clans',
    gifUrl: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    hasDiscount: false,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/app/clash-of-clans/id529479190',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.supercell.clashofclans',
    trailerUrl: 'https://www.youtube.com/watch?v=GC2qk2X3fKA',
    offers: [
      { title: '500 Gems', priceRUB: 299, priceUSDT: 3 },
      { title: '1200 Gems', priceRUB: 699, priceUSDT: 7 },
      { title: '2500 Gems', priceRUB: 1399, priceUSDT: 14 },
    ]
  },
  {
    title: '📲 Brawl Stars',
    imageUrl: 'https://via.placeholder.com/800x400?text=Brawl+Stars',
    gifUrl: 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif',
    hasDiscount: true,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/app/brawl-stars/id1229016807',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.supercell.brawlstars',
    trailerUrl: 'https://www.youtube.com/watch?v=PlHl_5HcqgA',
    offers: [
      { title: '30 Gems', priceRUB: 99, priceUSDT: 1 },
      { title: '170 Gems', priceRUB: 499, priceUSDT: 5 },
      { title: 'Brawl Pass', priceRUB: 899, priceUSDT: 9 },
    ]
  },
  {
    title: '📲 Genshin Impact',
    imageUrl: 'https://via.placeholder.com/800x400?text=Genshin+Impact',
    gifUrl: 'https://media.giphy.com/media/XGU4vKfY0p8KFqTPwj/giphy.gif',
    hasDiscount: false,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/app/genshin-impact/id1517783697',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.miHoYo.GenshinImpact',
    trailerUrl: 'https://www.youtube.com/watch?v=TAlKhARUcoY',
    offers: [
      { title: '60 Genesis Crystals', priceRUB: 99, priceUSDT: 1 },
      { title: '300 Genesis Crystals', priceRUB: 499, priceUSDT: 5 },
      { title: '980 Genesis Crystals', priceRUB: 1599, priceUSDT: 16 },
      { title: 'Blessing of the Welkin Moon', priceRUB: 399, priceUSDT: 4 },
    ]
  },
  {
    title: '📲 Roblox',
    imageUrl: 'https://via.placeholder.com/800x400?text=Roblox',
    gifUrl: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
    hasDiscount: true,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/app/roblox/id431946152',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.roblox.client',
    trailerUrl: 'https://www.youtube.com/watch?v=6cm2iFmASBc',
    offers: [
      { title: '400 Robux', priceRUB: 299, priceUSDT: 3 },
      { title: '800 Robux', priceRUB: 599, priceUSDT: 6 },
      { title: '1700 Robux', priceRUB: 1199, priceUSDT: 12 },
      { title: 'Premium 450', priceRUB: 399, priceUSDT: 4 },
    ]
  },
  {
    title: '📲 Minecraft',
    imageUrl: 'https://via.placeholder.com/800x400?text=Minecraft',
    gifUrl: 'https://media.giphy.com/media/kHU8W94VS329y/giphy.gif',
    hasDiscount: false,
    isActual: true,
    isEnabled: true,
    appleStoreUrl: 'https://apps.apple.com/app/minecraft/id479516143',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.mojang.minecraftpe',
    trailerUrl: 'https://www.youtube.com/watch?v=MmB9b5njVbA',
    offers: [
      { title: '320 Minecoins', priceRUB: 199, priceUSDT: 2 },
      { title: '1020 Minecoins', priceRUB: 599, priceUSDT: 6 },
      { title: '3500 Minecoins', priceRUB: 1999, priceUSDT: 20 },
    ]
  },
];

async function seedGames() {
  console.log('🌱 Начинаю заполнение БД играми и офферами...\n');

  try {
    // Проверяем подключение
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно\n');

    let gamesCreated = 0;
    let offersCreated = 0;

    for (const gameData of GAMES_DATA) {
      const { offers, ...gameInfo } = gameData;

      // Проверяем существует ли игра
      const existingGame = await prisma.game.findFirst({
        where: { title: gameInfo.title }
      });

      if (existingGame) {
        console.log(`⏭️  Игра "${gameInfo.title}" уже существует, пропускаю...`);
        continue;
      }

      // Создаем игру с офферами
      const game = await prisma.game.create({
        data: {
          ...gameInfo,
          offers: {
            create: offers.map(offer => ({
              ...offer,
              imageUrl: gameInfo.imageUrl,
              isEnabled: true,
            }))
          }
        },
        include: {
          offers: true
        }
      });

      gamesCreated++;
      offersCreated += game.offers.length;

      console.log(`✅ Создана игра: ${game.title}`);
      console.log(`   📦 Офферов: ${game.offers.length}`);
      game.offers.forEach(offer => {
        console.log(`      - ${offer.title}: ${offer.priceRUB}₽ / ${offer.priceUSDT} USDT`);
      });
      console.log('');
    }

    console.log('\n🎉 Заполнение завершено!');
    console.log(`📊 Статистика:`);
    console.log(`   🎮 Игр создано: ${gamesCreated}`);
    console.log(`   📦 Офферов создано: ${offersCreated}`);

    // Показываем итоговую статистику
    const totalGames = await prisma.game.count();
    const totalOffers = await prisma.offer.count();
    const totalUsers = await prisma.user.count();

    console.log(`\n📈 Всего в БД:`);
    console.log(`   🎮 Игр: ${totalGames}`);
    console.log(`   📦 Офферов: ${totalOffers}`);
    console.log(`   👥 Пользователей: ${totalUsers}`);

  } catch (error) {
    console.error('\n❌ Ошибка при заполнении БД:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск
seedGames()
  .then(() => {
    console.log('\n✅ Скрипт завершен успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Критическая ошибка:', error);
    process.exit(1);
  });
