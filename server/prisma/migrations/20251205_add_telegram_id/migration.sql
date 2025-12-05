-- Add telegramId column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telegramId" BIGINT;

-- Make it unique
CREATE UNIQUE INDEX IF NOT EXISTS "users_telegramId_key" ON "users"("telegramId");

-- Update existing users with dummy telegramId if they don't have one
UPDATE "users" SET "telegramId" = id WHERE "telegramId" IS NULL;

-- Make it NOT NULL after updating
ALTER TABLE "users" ALTER COLUMN "telegramId" SET NOT NULL;
