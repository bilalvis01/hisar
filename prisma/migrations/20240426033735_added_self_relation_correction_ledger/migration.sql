/*
  Warnings:

  - A unique constraint covering the columns `[correctedLedgerId]` on the table `Ledger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Ledger` ADD COLUMN `correctedLedgerId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Ledger_correctedLedgerId_key` ON `Ledger`(`correctedLedgerId`);

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_correctedLedgerId_fkey` FOREIGN KEY (`correctedLedgerId`) REFERENCES `Ledger`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
