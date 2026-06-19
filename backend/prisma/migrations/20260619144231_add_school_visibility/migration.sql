-- AlterTable
ALTER TABLE "School" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "School_status_isVisible_idx" ON "School"("status", "isVisible");
