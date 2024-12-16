/*
  Warnings:

  - You are about to drop the column `hours` on the `WBSActivity` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `WBSActivity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WBSActivity" DROP COLUMN "hours",
DROP COLUMN "rate";
