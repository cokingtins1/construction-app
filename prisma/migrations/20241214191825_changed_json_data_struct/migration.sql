/*
  Warnings:

  - The `hours` column on the `WBSTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rates` column on the `WBSTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `team_members` column on the `WBSTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "middle_name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WBSTemplate" DROP COLUMN "hours",
ADD COLUMN     "hours" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "rates",
ADD COLUMN     "rates" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "team_members",
ADD COLUMN     "team_members" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- CreateTable
CREATE TABLE "WBSActivity" (
    "id" TEXT NOT NULL,

    CONSTRAINT "WBSActivity_pkey" PRIMARY KEY ("id")
);
