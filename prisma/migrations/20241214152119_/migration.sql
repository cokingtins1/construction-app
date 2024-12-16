/*
  Warnings:

  - You are about to drop the column `staffLevelId` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `staff_level` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the `StaffLevel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rateLevelCode` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_staffLevelId_fkey";

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "staffLevelId",
DROP COLUMN "staff_level",
ADD COLUMN     "rateLevelCode" TEXT NOT NULL;

-- DropTable
DROP TABLE "StaffLevel";

-- CreateTable
CREATE TABLE "RateLevel" (
    "id" TEXT NOT NULL,
    "level_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,

    CONSTRAINT "RateLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateLevel_code_key" ON "RateLevel"("code");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_rateLevelCode_fkey" FOREIGN KEY ("rateLevelCode") REFERENCES "RateLevel"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
