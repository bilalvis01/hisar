/*
  Warnings:

  - Added the required column `debet` to the `Debet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Debet` ADD COLUMN `debet` DECIMAL(10, 2) NOT NULL;
