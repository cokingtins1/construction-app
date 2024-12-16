/*
  Warnings:

  - You are about to drop the column `team_member_id` on the `WBSActivity` table. All the data in the column will be lost.
  - You are about to drop the column `wbsTemplateId` on the `WBSActivity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WBSActivity" DROP CONSTRAINT "WBSActivity_team_member_id_fkey";

-- DropForeignKey
ALTER TABLE "WBSActivity" DROP CONSTRAINT "WBSActivity_wbsTemplateId_fkey";

-- AlterTable
ALTER TABLE "WBSActivity" DROP COLUMN "team_member_id",
DROP COLUMN "wbsTemplateId",
ADD COLUMN     "wBSTemplateId" TEXT;

-- CreateTable
CREATE TABLE "WBSAssignment" (
    "id" TEXT NOT NULL,
    "wbsTemplateId" TEXT NOT NULL,
    "team_member_id" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_dollars" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "WBSAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WBSActivity" ADD CONSTRAINT "WBSActivity_wBSTemplateId_fkey" FOREIGN KEY ("wBSTemplateId") REFERENCES "WBSTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBSAssignment" ADD CONSTRAINT "WBSAssignment_wbsTemplateId_fkey" FOREIGN KEY ("wbsTemplateId") REFERENCES "WBSActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBSAssignment" ADD CONSTRAINT "WBSAssignment_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
