/*
  Warnings:

  - You are about to drop the column `codeId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `supcodeId` on the `AccountCode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountCodeId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,accountSupercodeId]` on the table `AccountCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountCodeId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_codeId_fkey`;

-- DropForeignKey
ALTER TABLE `AccountCode` DROP FOREIGN KEY `AccountCode_supcodeId_fkey`;

-- DropIndex
DROP INDEX `AccountCode_code_supcodeId_key` ON `AccountCode`;

-- AlterTable
ALTER TABLE `Account` DROP COLUMN `codeId`,
    ADD COLUMN `accountCodeId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `AccountCode` DROP COLUMN `supcodeId`,
    ADD COLUMN `accountSupercodeId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Account_accountCodeId_key` ON `Account`(`accountCodeId`);

-- CreateIndex
CREATE UNIQUE INDEX `AccountCode_code_accountSupercodeId_key` ON `AccountCode`(`code`, `accountSupercodeId`);

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_accountCodeId_fkey` FOREIGN KEY (`accountCodeId`) REFERENCES `AccountCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountCode` ADD CONSTRAINT `AccountCode_accountSupercodeId_fkey` FOREIGN KEY (`accountSupercodeId`) REFERENCES `AccountCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
