-- CreateTable
CREATE TABLE "SpeedNetworkingComment" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "proctorName" TEXT NOT NULL,
    "proctorEmail" TEXT NOT NULL,
    "flag" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeedNetworkingComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpeedNetworkingComment_applicantId_proctorEmail_cycleId_key" ON "SpeedNetworkingComment"("applicantId", "proctorEmail", "cycleId");

-- AddForeignKey
ALTER TABLE "SpeedNetworkingComment" ADD CONSTRAINT "SpeedNetworkingComment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeedNetworkingComment" ADD CONSTRAINT "SpeedNetworkingComment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "RecruitmentCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
