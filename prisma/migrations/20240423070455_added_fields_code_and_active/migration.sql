/*
  Warnings:

  - Added the required column `code` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Account` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `code` INTEGER NOT NULL;
