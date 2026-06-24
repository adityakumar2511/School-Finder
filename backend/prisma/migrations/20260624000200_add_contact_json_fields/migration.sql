ALTER TABLE "School"
ADD COLUMN IF NOT EXISTS "admissionCoordinators" JSONB,
ADD COLUMN IF NOT EXISTS "additionalPhones" JSONB;
