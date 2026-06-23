/*
  Warnings:

  - Added the required column `phone` to the `ContactSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactSubmission" ADD COLUMN "phone" TEXT;
