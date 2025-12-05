// Inserts provided Mongo mock data into PostgreSQL via Prisma (generated JS client)
// Run: node server/scripts/insert-mock.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function cleanUrl(url) {
  if (!url) return null;
  // remove backticks and spaces in provided strings
  return String(url).replace(/`/g, '').trim();
}

async function run() {
  try {
    console.log('Connecting to PostgreSQL...');
    await prisma.$connect();
    console.log('Connected. Inserting mock data...');

    // Optional user seed (skip if schema differs)
    try {
      const telegramId = BigInt(508173732);
      const userData = {
        telegramId,
        username: 'Legendy_Vlad',
        language: 'ru',
        isBanned: false,
        isSubscribed: true,
        avatarUrl: cleanUrl('https://api.telegram.org/file/bot6378846431:AAHQKHdVQRE07DsKDECF1y3rEZynolWuM9I/photos/file_2.jpg'),
        balanceRUB: 0,
        balanceUSDT: 0,
        ordersCount: 0,
        referralPercent: 1,
        acceptedPrivacyConsent: false,
      };

      const existingUser = await prisma.user.findFirst({ where: { username: 'Legendy_Vlad' } });
      if (existingUser) {
        console.log(`User ${existingUser.username} already exists. Skipping create.`);
      } else {
        const newUser = await prisma.user.create({ data: userData });
        console.log(`Inserted user id=${newUser.id}`);
      }
    } catch (e) {
      console.warn('User seed skipped due to schema mismatch:', e.message || e);
    }

    // Games from Mongo mock
    const games = [
      {
        title: '📲 Asphalt Legends - Racing Game',
        imageUrl: cleanUrl('https://i.ibb.co/BHqtVK4Q/PLmy-Zqt-Hm-PZ.jpg'),
        gifUrl: cleanUrl('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25iMG9hcXpnamUzMmV3ZWd2cGtqb2F5NGwyajA3a21tb3B1c3c1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LDjKkXTfIPZ7zYOcvq/giphy.gif'),
        hasDiscount: true,
        isActual: true, // Mongo isActive -> Prisma isActual
        isEnabled: true,
        appleStoreUrl: cleanUrl('https://apps.apple.com/us/app/asphalt-legends-racing-game/id805603214'),
        googlePlayUrl: cleanUrl('https://play.google.com/store/apps/details?id=com.gameloft.android.ANMP.GloftA9HM&listing=as9_porsche_911_csl_092023&hl=en-US'),
        trailerUrl: cleanUrl('https://youtu.be/TEuZZB_zSOw'),
      },
      {
        title: '📲 EA SPORTS FC™ Mobile Football',
        imageUrl: cleanUrl('https://i.ibb.co/8gqJrKMF/Ysdb-Aauqynx.jpg'),
        gifUrl: cleanUrl('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWdqbGlqNnV3cG9nejc4anNudm5ycXE3bmhkMWhjZnlxejlsejExNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Br5i1DgRrNT9uCvssd/giphy.gif'),
        hasDiscount: false,
        isActual: true,
        isEnabled: true,
        appleStoreUrl: cleanUrl('https://apps.apple.com/us/app/ea-sports-fc-mobile-soccer/id1094930513'),
        googlePlayUrl: cleanUrl('https://play.google.com/store/apps/details?id=com.ea.gp.fifamobile&hl=ru'),
        trailerUrl: cleanUrl('https://youtu.be/TEuZZB_zSOw'),
      },
    ];

    for (const g of games) {
      const found = await prisma.game.findFirst({ where: { title: g.title } });
      if (found) {
        console.log(`Game "${g.title}" already exists (id=${found.id}). Skipping.`);
      } else {
        const created = await prisma.game.create({ data: g });
        console.log(`Inserted game id=${created.id}, title="${created.title}"`);
      }
    }

    // Offers for each game
    const allGames = await prisma.game.findMany();
    for (const game of allGames) {
      const existingOffers = await prisma.offer.findMany({ where: { gameId: game.id } });
      if (existingOffers.length > 0) {
        console.log(`Offers for game id=${game.id} already exist (${existingOffers.length}). Skipping.`);
        continue;
      }
      const baseImage = game.imageUrl;
      const created = await prisma.offer.create({
        data: {
          title: 'Starter Pack',
          imageUrl: baseImage,
          priceRUB: 199,
          priceUSDT: 2,
          isEnabled: true,
          game: { connect: { id: game.id } },
        }
      });
      console.log(`Inserted offer id=${created.id} for game id=${game.id}`);
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error inserting mock data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

