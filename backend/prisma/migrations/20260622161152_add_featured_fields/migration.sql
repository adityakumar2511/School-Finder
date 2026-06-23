-- AlterTable
ALTER TABLE "School" ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "School_isFeatured_status_idx" ON "School"("isFeatured", "status");
