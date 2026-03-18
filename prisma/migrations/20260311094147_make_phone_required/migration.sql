/*
  Warnings:

  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- Fill NULL phone values with a placeholder before making the column required
UPDATE "users" SET "phone" = CONCAT('+00000', id) WHERE "phone" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;
