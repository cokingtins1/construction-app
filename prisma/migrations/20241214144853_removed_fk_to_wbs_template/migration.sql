/*
  Warnings:

  - You are about to drop the column `clientId` on the `WBSTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `projectsId` on the `WBSTemplate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WBSTemplate" DROP CONSTRAINT "WBSTemplate_clientId_fkey";

-- DropForeignKey
ALTER TABLE "WBSTemplate" DROP CONSTRAINT "WBSTemplate_projectsId_fkey";

-- AlterTable
ALTER TABLE "WBSTemplate" DROP COLUMN "clientId",
DROP COLUMN "projectsId";
