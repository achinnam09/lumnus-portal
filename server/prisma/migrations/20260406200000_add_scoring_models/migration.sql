-- CreateTable
CREATE TABLE "InfoNightComment" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "proctorName" TEXT NOT NULL,
    "proctorPid" TEXT NOT NULL,
    "flag" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoNightComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudyScore" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "proctorName" TEXT NOT NULL,
    "proctorPid" TEXT NOT NULL,
    "communicationScore" DOUBLE PRECISION NOT NULL,
    "analyticalScore" DOUBLE PRECISION NOT NULL,
    "personableScore" DOUBLE PRECISION NOT NULL,
    "commitmentScore" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "rawScores" JSONB NOT NULL,
    "communicationComment" TEXT,
    "analyticalComment" TEXT,
    "personableComment" TEXT,
    "commitmentComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseStudyScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfoNightComment_applicantId_proctorPid_cycleId_key" ON "InfoNightComment"("applicantId", "proctorPid", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudyScore_applicantId_proctorPid_cycleId_key" ON "CaseStudyScore"("applicantId", "proctorPid", "cycleId");

-- AddForeignKey
ALTER TABLE "InfoNightComment" ADD CONSTRAINT "InfoNightComment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoNightComment" ADD CONSTRAINT "InfoNightComment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "RecruitmentCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStudyScore" ADD CONSTRAINT "CaseStudyScore_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStudyScore" ADD CONSTRAINT "CaseStudyScore_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "RecruitmentCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
