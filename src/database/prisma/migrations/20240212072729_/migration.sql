/*
  Warnings:

  - You are about to drop the column `deleteAt` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `deleteAt` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `deleteAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `deleteAt` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `deleteAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `applications` DROP COLUMN `deleteAt`,
    ADD COLUMN `deletedAt` DATETIME(0) NULL,
    MODIFY `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `notes` DROP COLUMN `deleteAt`,
    ADD COLUMN `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `deleteAt`,
    ADD COLUMN `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `deleteAt`,
    ADD COLUMN `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `deleteAt`,
    ADD COLUMN `deletedAt` DATETIME(0) NULL;
