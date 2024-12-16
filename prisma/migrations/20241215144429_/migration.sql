/*
  Warnings:

  - You are about to drop the column `isTemplate` on the `WBSAssignment` table. All the data in the column will be lost.
  - Added the required column `isTemplate` to the `WBSTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WBSAssignment" DROP COLUMN "isTemplate";

-- AlterTable
ALTER TABLE "WBSTemplate" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL;
