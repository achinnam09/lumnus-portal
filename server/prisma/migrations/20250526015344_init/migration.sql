-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pid" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recruitmentCycle" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);
