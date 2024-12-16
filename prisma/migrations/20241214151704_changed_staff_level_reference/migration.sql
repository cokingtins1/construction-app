/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `StaffLevel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_staffLevelId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "StaffLevel_code_key" ON "StaffLevel"("code");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_staffLevelId_fkey" FOREIGN KEY ("staffLevelId") REFERENCES "StaffLevel"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
