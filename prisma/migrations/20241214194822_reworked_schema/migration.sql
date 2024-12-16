/*
  Warnings:

  - You are about to drop the column `total_cost` on the `WBSActivity` table. All the data in the column will be lost.
  - You are about to drop the column `assumption` on the `WBSTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `task` on the `WBSTemplate` table. All the data in the column will be lost.
  - Added the required column `task` to the `WBSActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WBSActivity" DROP COLUMN "total_cost",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "task" TEXT NOT NULL,
ADD COLUMN     "total_dollars" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WBSTemplate" DROP COLUMN "assumption",
DROP COLUMN "task";

-- AddForeignKey
ALTER TABLE "WBSActivity" ADD CONSTRAINT "WBSActivity_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
