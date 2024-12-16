/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "WBSTemplate" (
    "id" SERIAL NOT NULL,
    "task" TEXT NOT NULL,
    "assumption" TEXT,
    "hours" JSONB NOT NULL DEFAULT '{}',
    "rates" JSONB NOT NULL DEFAULT '{}',
    "total_dollars" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "WBSTemplate_pkey" PRIMARY KEY ("id")
);
