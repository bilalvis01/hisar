/*
  Warnings:

  - Added the required column `direction` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Account` ADD COLUMN `direction` TINYINT NOT NULL;
