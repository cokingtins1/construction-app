/*
  Warnings:

  - The primary key for the `WBSTemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `department` to the `WBSTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_phase` to the `WBSTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectsId` to the `WBSTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WBSTemplate" DROP CONSTRAINT "WBSTemplate_pkey",
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "project_phase" TEXT NOT NULL,
ADD COLUMN     "projectsId" TEXT NOT NULL,
ADD COLUMN     "team_members" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WBSTemplate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WBSTemplate_id_seq";

-- CreateTable
CREATE TABLE "Projects" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WBSTemplate" ADD CONSTRAINT "WBSTemplate_projectsId_fkey" FOREIGN KEY ("projectsId") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
