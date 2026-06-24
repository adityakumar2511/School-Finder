/*
  Warnings:

  - You are about to drop the column `class10Pass` on the `BoardResult` table. All the data in the column will be lost.
  - You are about to drop the column `class12Pass` on the `BoardResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BoardResult" DROP COLUMN "class10Pass",
DROP COLUMN "class12Pass",
ADD COLUMN     "classLevel" TEXT NOT NULL DEFAULT 'CLASS_10',
ADD COLUMN     "passPercent" TEXT;

-- CreateIndex
CREATE INDEX "BoardResult_schoolId_classLevel_idx" ON "BoardResult"("schoolId", "classLevel");
