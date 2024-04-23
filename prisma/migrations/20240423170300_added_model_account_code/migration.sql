/*
  Warnings:

  - You are about to drop the column `code` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codeId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codeId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Account` DROP COLUMN `code`,
    DROP COLUMN `type`,
    ADD COLUMN `codeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `AccountCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` INTEGER NOT NULL,
    `supcodeId` INTEGER NULL,
    `category` VARCHAR(20) NULL,

    UNIQUE INDEX `AccountCode_code_supcodeId_key`(`code`, `supcodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Account_codeId_key` ON `Account`(`codeId`);

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `AccountCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountCode` ADD CONSTRAINT `AccountCode_supcodeId_fkey` FOREIGN KEY (`supcodeId`) REFERENCES `AccountCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
