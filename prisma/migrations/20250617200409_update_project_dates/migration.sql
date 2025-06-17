/*
  Warnings:

  - You are about to drop the column `startDate` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Project` DROP COLUMN `startDate`,
    ADD COLUMN `dueDate` DATETIME(3) NULL;
