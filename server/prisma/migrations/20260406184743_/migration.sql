/*
  Warnings:

  - A unique constraint covering the columns `[pid,cycleId]` on the table `Applicant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicantId,eventId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Track" AS ENUM ('Strategy', 'DataAnalytics');

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "minor" TEXT,
    "track" "Track" NOT NULL,
    "essay1" TEXT NOT NULL,
    "essay2" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "headshotUrl" TEXT NOT NULL,
    "heardFrom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicantId_key" ON "Application"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicantId_cycleId_key" ON "Application"("applicantId", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_pid_cycleId_key" ON "Applicant"("pid", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_applicantId_eventId_key" ON "Attendance"("applicantId", "eventId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "RecruitmentCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
