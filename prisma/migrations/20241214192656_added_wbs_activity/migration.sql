/*
  Warnings:

  - You are about to drop the column `hours` on the `WBSTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `rates` on the `WBSTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `team_members` on the `WBSTemplate` table. All the data in the column will be lost.
  - Added the required column `team_member_id` to the `WBSActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wbsTemplateId` to the `WBSActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WBSActivity" ADD COLUMN     "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "team_member_id" TEXT NOT NULL,
ADD COLUMN     "total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "wbsTemplateId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WBSTemplate" DROP COLUMN "hours",
DROP COLUMN "rates",
DROP COLUMN "team_members";

-- AddForeignKey
ALTER TABLE "WBSActivity" ADD CONSTRAINT "WBSActivity_wbsTemplateId_fkey" FOREIGN KEY ("wbsTemplateId") REFERENCES "WBSTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
