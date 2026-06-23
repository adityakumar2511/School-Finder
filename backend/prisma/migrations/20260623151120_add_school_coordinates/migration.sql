-- AlterTable
ALTER TABLE "School" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "School_state_status_idx" ON "School"("state", "status");

-- CreateIndex
CREATE INDEX "School_latitude_longitude_idx" ON "School"("latitude", "longitude");
