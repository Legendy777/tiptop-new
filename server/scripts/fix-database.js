#!/usr/bin/env node

/**
 * Скрипт для исправления базы данных
 * Добавляет telegramId колонку если её нет
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  console.log('🔧 Проверка и исправление базы данных...');

  try {
    // Проверяем есть ли колонка telegramId
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'telegramId';
    `;

    if (result.length === 0) {
      console.log('❌ Колонка telegramId не найдена. Добавляю...');

      // Добавляем колонку
      await prisma.$executeRaw`
        ALTER TABLE "users" ADD COLUMN "telegramId" BIGINT;
      `;
      console.log('✅ Колонка telegramId добавлена');

      // Обновляем существующие записи
      await prisma.$executeRaw`
        UPDATE "users" SET "telegramId" = id WHERE "telegramId" IS NULL;
      `;
      console.log('✅ Существующие записи обновлены');

      // Делаем колонку NOT NULL
      await prisma.$executeRaw`
        ALTER TABLE "users" ALTER COLUMN "telegramId" SET NOT NULL;
      `;
      console.log('✅ Колонка telegramId теперь NOT NULL');

      // Создаем уникальный индекс
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "users_telegramId_key" ON "users"("telegramId");
      `;
      console.log('✅ Уникальный индекс создан');

    } else {
      console.log('✅ Колонка telegramId уже существует');
    }

    // Проверяем количество пользователей
    const userCount = await prisma.user.count();
    console.log(`📊 Пользователей в БД: ${userCount}`);

    // Проверяем количество игр
    const gameCount = await prisma.game.count();
    console.log(`🎮 Игр в БД: ${gameCount}`);

    if (gameCount === 0) {
      console.log('⚠️  Игры не найдены. Запустите seed скрипт.');
    }

    console.log('✅ База данных исправлена!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Ошибка при исправлении БД:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();
