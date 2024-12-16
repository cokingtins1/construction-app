/*
  Warnings:

  - You are about to drop the `Projects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clientId` to the `WBSTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WBSTemplate" DROP CONSTRAINT "WBSTemplate_projectsId_fkey";

-- AlterTable
ALTER TABLE "WBSTemplate" ADD COLUMN     "clientId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Projects";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "project_number" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "staff_level" TEXT NOT NULL,
    "staffLevelId" TEXT NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffLevel" (
    "id" TEXT NOT NULL,
    "level_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,

    CONSTRAINT "StaffLevel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WBSTemplate" ADD CONSTRAINT "WBSTemplate_projectsId_fkey" FOREIGN KEY ("projectsId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBSTemplate" ADD CONSTRAINT "WBSTemplate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_staffLevelId_fkey" FOREIGN KEY ("staffLevelId") REFERENCES "StaffLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
