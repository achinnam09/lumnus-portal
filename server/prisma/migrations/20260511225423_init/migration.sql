/*
  Warnings:

  - You are about to drop the column `pid` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `proctorPid` on the `CaseStudyScore` table. All the data in the column will be lost.
  - You are about to drop the column `rawScores` on the `CaseStudyScore` table. All the data in the column will be lost.
  - You are about to drop the column `proctorPid` on the `InfoNightComment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,cycleId]` on the table `Applicant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicantId,proctorEmail,cycleId]` on the table `CaseStudyScore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicantId,proctorEmail,cycleId]` on the table `InfoNightComment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proctorEmail` to the `CaseStudyScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proctorEmail` to the `InfoNightComment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Applicant_pid_cycleId_key";

-- DropIndex
DROP INDEX "Application_applicantId_key";

-- DropIndex
DROP INDEX "CaseStudyScore_applicantId_proctorPid_cycleId_key";

-- DropIndex
DROP INDEX "InfoNightComment_applicantId_proctorPid_cycleId_key";

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "pid",
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CaseStudyScore" DROP COLUMN "proctorPid",
DROP COLUMN "rawScores",
ADD COLUMN     "flag" TEXT,
ADD COLUMN     "flagComment" TEXT,
ADD COLUMN     "proctorEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InfoNightComment" DROP COLUMN "proctorPid",
ADD COLUMN     "proctorEmail" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AssessmentCenterScore" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "proctorName" TEXT NOT NULL,
    "proctorEmail" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "communicationScore" DOUBLE PRECISION NOT NULL,
    "analyticalScore" DOUBLE PRECISION NOT NULL,
    "personableScore" DOUBLE PRECISION NOT NULL,
    "commitmentScore" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "communicationComment" TEXT,
    "analyticalComment" TEXT,
    "personableComment" TEXT,
    "commitmentComment" TEXT,
    "flag" TEXT,
    "flagComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentCenterScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentCenterScore_applicantId_proctorEmail_station_cycl_key" ON "AssessmentCenterScore"("applicantId", "proctorEmail", "station", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_cycleId_key" ON "Applicant"("email", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudyScore_applicantId_proctorEmail_cycleId_key" ON "CaseStudyScore"("applicantId", "proctorEmail", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "InfoNightComment_applicantId_proctorEmail_cycleId_key" ON "InfoNightComment"("applicantId", "proctorEmail", "cycleId");

-- AddForeignKey
ALTER TABLE "AssessmentCenterScore" ADD CONSTRAINT "AssessmentCenterScore_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentCenterScore" ADD CONSTRAINT "AssessmentCenterScore_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "RecruitmentCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
