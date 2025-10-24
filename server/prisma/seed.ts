import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Очищаем существующие данные (осторожно! это удалит все данные)
  console.log('🗑️  Clearing existing data...');
  await prisma.orderDetails.deleteMany();
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  // Создаём пользователей
  console.log('👤 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        telegramId: BigInt(111111111), // Test Telegram ID 1
        username: 'test_user_1',
        language: 'ru',
        balanceRUB: 1000,
        balanceUSDT: 50,
        isSubscribed: true,
        acceptedPrivacyConsent: true,
      },
    }),
    prisma.user.create({
      data: {
        telegramId: BigInt(222222222), // Test Telegram ID 2
        username: 'test_user_2',
        language: 'en',
        balanceRUB: 500,
        balanceUSDT: 25,
        isSubscribed: false,
        acceptedPrivacyConsent: true,
      },
    }),
    prisma.user.create({
      data: {
        telegramId: BigInt(333333333), // Test Admin Telegram ID
        username: 'admin_user',
        language: 'ru',
        balanceRUB: 10000,
        balanceUSDT: 500,
        isSubscribed: true,
        acceptedPrivacyConsent: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Создаём игры
  console.log('🎮 Creating games...');
  const games = await Promise.all([
    prisma.game.create({
      data: {
        title: 'Mobile Legends',
        imageUrl: 'https://via.placeholder.com/800x400?text=Mobile+Legends',
        gifUrl: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
        hasDiscount: true,
        isActual: true,
        isEnabled: true,
        appleStoreUrl: 'https://apps.apple.com/app/mobile-legends',
        googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.mobile.legends',
        trailerUrl: 'https://youtube.com/watch?v=example',
      },
    }),
    prisma.game.create({
      data: {
        title: 'PUBG Mobile',
        imageUrl: 'https://via.placeholder.com/800x400?text=PUBG+Mobile',
        gifUrl: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
        hasDiscount: false,
        isActual: true,
        isEnabled: true,
        appleStoreUrl: 'https://apps.apple.com/app/pubg-mobile',
        googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.pubg.krmobile',
        trailerUrl: 'https://youtube.com/watch?v=example2',
      },
    }),
    prisma.game.create({
      data: {
        title: 'Genshin Impact',
        imageUrl: 'https://via.placeholder.com/800x400?text=Genshin+Impact',
        gifUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        hasDiscount: true,
        isActual: true,
        isEnabled: true,
        appleStoreUrl: 'https://apps.apple.com/app/genshin-impact',
        googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.miHoYo.GenshinImpact',
        trailerUrl: 'https://youtube.com/watch?v=example3',
      },
    }),
  ]);

  console.log(`✅ Created ${games.length} games`);

  // Создаём офферы для каждой игры
  console.log('💎 Creating offers...');
  const offers = [];
  for (const game of games) {
    const gameOffers = await Promise.all([
      prisma.offer.create({
        data: {
          gameId: game.id,
          title: `${game.title} - Starter Pack`,
          imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(game.title)}+Starter`,
          priceRUB: 299,
          priceUSDT: 3.5,
          isEnabled: true,
        },
      }),
      prisma.offer.create({
        data: {
          gameId: game.id,
          title: `${game.title} - Premium Pack`,
          imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(game.title)}+Premium`,
          priceRUB: 999,
          priceUSDT: 11.5,
          isEnabled: true,
        },
      }),
      prisma.offer.create({
        data: {
          gameId: game.id,
          title: `${game.title} - Ultimate Pack`,
          imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(game.title)}+Ultimate`,
          priceRUB: 2999,
          priceUSDT: 35,
          isEnabled: true,
        },
      }),
    ]);
    offers.push(...gameOffers);
  }

  console.log(`✅ Created ${offers.length} offers`);

  // Создаём тестовые заказы
  console.log('📦 Creating orders...');
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        offerId: offers[0].id,
        paymentId: 1, // will update after payment creation
        currency: 'USDT',
        status: 'completed',
      },
    }),
    prisma.order.create({
      data: {
        userId: users[0].id,
        offerId: offers[1].id,
        paymentId: 2, // will update after payment creation
        currency: 'USDT',
        status: 'pending',
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        offerId: offers[2].id,
        paymentId: 3, // will update after payment creation
        currency: 'RUB',
        status: 'process',
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} orders`);

  // Создаём платежи
  console.log('💳 Creating payments...');
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        userId: users[0].id,
        offerId: offers[0].id,
        orderId: orders[0].id,
        amountToPay: 3.5,
        currency: 'USDT',
        externalId: 'test_payment_1',
        status: 'completed',
      },
    }),
    prisma.payment.create({
      data: {
        userId: users[0].id,
        offerId: offers[1].id,
        orderId: orders[1].id,
        amountToPay: 11.5,
        currency: 'USDT',
        externalId: 'test_payment_2',
        status: 'pending',
      },
    }),
  ]);

  console.log(`✅ Created ${payments.length} payments`);

  // Создаём рефералов
  console.log('🤝 Creating referrals...');
  const referrals = await Promise.all([
    prisma.referral.create({
      data: {
        userId: users[1].id,
        referId: users[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${referrals.length} referrals`);

  // Создаём отзывы
  console.log('⭐ Creating reviews...');
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[0].id,
        orderId: orders[0].id,
        username: users[0].username,
        rating: 5,
        comment: 'Отличная игра! Рекомендую!',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        orderId: orders[2].id,
        username: users[1].username,
        rating: 4,
        comment: 'Good game, but needs optimization',
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // Создаём транзакции
  console.log('💰 Creating transactions...');
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        userId: users[0].id,
        type: 'order',
        amount: -3.5,
        currency: 'USDT',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: users[0].id,
        referId: users[1].id,
        type: 'refund',
        amount: 5,
        currency: 'USDT',
        earned: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${transactions.length} transactions`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Games: ${games.length}`);
  console.log(`   - Offers: ${offers.length}`);
  console.log(`   - Orders: ${orders.length}`);
  console.log(`   - Payments: ${payments.length}`);
  console.log(`   - Referrals: ${referrals.length}`);
  console.log(`   - Reviews: ${reviews.length}`);
  console.log(`   - Transactions: ${transactions.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
