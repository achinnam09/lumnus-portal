/*
  Warnings:

  - You are about to drop the column `event` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `pid` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `recruitmentCycle` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `applicantId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "event",
DROP COLUMN "name",
DROP COLUMN "pid",
DROP COLUMN "recruitmentCycle",
ADD COLUMN     "applicantId" INTEGER NOT NULL,
ADD COLUMN     "eventId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RecruitmentCycle" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "RecruitmentCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pid" TEXT NOT NULL,
    "cycleId" INTEGER NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cycleId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentCycle_label_key" ON "RecruitmentCycle"("label");

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "RecruitmentCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "RecruitmentCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
