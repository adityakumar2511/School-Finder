-- AlterTable
ALTER TABLE "School" ADD COLUMN     "academicAchievements" TEXT,
ADD COLUMN     "admissionCoordinatorName" TEXT,
ADD COLUMN     "admissionEmail" TEXT,
ADD COLUMN     "admissionEndDate" TIMESTAMP(3),
ADD COLUMN     "admissionOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "admissionPhone" TEXT,
ADD COLUMN     "admissionProcess" TEXT,
ADD COLUMN     "admissionStartDate" TIMESTAMP(3),
ADD COLUMN     "affiliationNumber" TEXT,
ADD COLUMN     "ageCriteria" TEXT,
ADD COLUMN     "annualEvents" TEXT,
ADD COLUMN     "averageAnnualFee" INTEGER,
ADD COLUMN     "awardsRecognitions" TEXT,
ADD COLUMN     "campusArea" TEXT,
ADD COLUMN     "class11to12Fee" INTEGER,
ADD COLUMN     "class1to5Fee" INTEGER,
ADD COLUMN     "class6to8Fee" INTEGER,
ADD COLUMN     "class9to10Fee" INTEGER,
ADD COLUMN     "classesOffered" TEXT[],
ADD COLUMN     "clubsActivities" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "culturalActivities" TEXT,
ADD COLUMN     "educationalTours" TEXT,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "facilitiesList" TEXT[],
ADD COLUMN     "gpsTracking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasCCTV" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasFireSafety" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasGuards" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasMedicalRoom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasVisitorMgmt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostelAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostelBoys" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostelCapacity" INTEGER,
ADD COLUMN     "hostelGirls" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostelMess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "libraryBooks" INTEGER,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "managementType" TEXT,
ADD COLUMN     "mapUrl" TEXT,
ADD COLUMN     "mission" TEXT,
ADD COLUMN     "prePrimaryFee" INTEGER,
ADD COLUMN     "principalMessage" TEXT,
ADD COLUMN     "programsList" TEXT[],
ADD COLUMN     "qualifiedTeachers" INTEGER,
ADD COLUMN     "requiredDocuments" TEXT,
ADD COLUMN     "schoolCategory" TEXT,
ADD COLUMN     "schoolFormat" TEXT,
ADD COLUMN     "sportsAchievements" TEXT,
ADD COLUMN     "sportsList" TEXT[],
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "streamsOffered" TEXT[],
ADD COLUMN     "studentTeacherRatio" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "totalBuses" INTEGER,
ADD COLUMN     "totalClassrooms" INTEGER,
ADD COLUMN     "totalLabs" INTEGER,
ADD COLUMN     "totalTeachers" INTEGER,
ADD COLUMN     "totalVehicles" TEXT,
ADD COLUMN     "trainingPrograms" TEXT,
ADD COLUMN     "transportAreas" TEXT,
ADD COLUMN     "transportAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vision" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "workingDays" TEXT,
ADD COLUMN     "youtube" TEXT;

-- AlterTable
ALTER TABLE "SchoolImage" ADD COLUMN     "category" TEXT;

-- CreateTable
CREATE TABLE "SchoolCustomField" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL DEFAULT 'text',

    CONSTRAINT "SchoolCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardResult" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "class10Pass" TEXT,
    "class12Pass" TEXT,
    "topperName" TEXT,
    "topperScore" TEXT,

    CONSTRAINT "BoardResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eligibility" TEXT,
    "benefits" TEXT,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolFAQ" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "SchoolFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolDownload" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "SchoolDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolCustomField_schoolId_section_idx" ON "SchoolCustomField"("schoolId", "section");

-- CreateIndex
CREATE INDEX "BoardResult_schoolId_idx" ON "BoardResult"("schoolId");

-- CreateIndex
CREATE INDEX "Scholarship_schoolId_idx" ON "Scholarship"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolFAQ_schoolId_idx" ON "SchoolFAQ"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolDownload_schoolId_idx" ON "SchoolDownload"("schoolId");

-- AddForeignKey
ALTER TABLE "SchoolCustomField" ADD CONSTRAINT "SchoolCustomField_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardResult" ADD CONSTRAINT "BoardResult_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolFAQ" ADD CONSTRAINT "SchoolFAQ_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolDownload" ADD CONSTRAINT "SchoolDownload_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
