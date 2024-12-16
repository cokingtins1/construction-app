/*
  Warnings:

  - You are about to drop the column `rateLevelCode` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `wBSTemplateId` on the `WBSActivity` table. All the data in the column will be lost.
  - You are about to drop the column `wbsTemplateId` on the `WBSAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `isTemplate` on the `WBSTemplate` table. All the data in the column will be lost.
  - Added the required column `rate_level_code` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wbs_template_id` to the `WBSActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wbs_activity_id` to the `WBSAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_template` to the `WBSTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_rateLevelCode_fkey";

-- DropForeignKey
ALTER TABLE "WBSActivity" DROP CONSTRAINT "WBSActivity_wBSTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "WBSAssignment" DROP CONSTRAINT "WBSAssignment_wbsTemplateId_fkey";

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "rateLevelCode",
ADD COLUMN     "rate_level_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WBSActivity" DROP COLUMN "wBSTemplateId",
ADD COLUMN     "wbs_template_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WBSAssignment" DROP COLUMN "wbsTemplateId",
ADD COLUMN     "wbs_activity_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WBSTemplate" DROP COLUMN "isTemplate",
ADD COLUMN     "is_template" BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE "WBSActivity" ADD CONSTRAINT "WBSActivity_wbs_template_id_fkey" FOREIGN KEY ("wbs_template_id") REFERENCES "WBSTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBSAssignment" ADD CONSTRAINT "WBSAssignment_wbs_activity_id_fkey" FOREIGN KEY ("wbs_activity_id") REFERENCES "WBSActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_rate_level_code_fkey" FOREIGN KEY ("rate_level_code") REFERENCES "RateLevel"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
