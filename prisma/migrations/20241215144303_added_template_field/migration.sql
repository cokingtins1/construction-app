/*
  Warnings:

  - Added the required column `isTemplate` to the `WBSAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WBSAssignment" ADD COLUMN     "isTemplate" BOOLEAN NOT NULL;
