-- Add reference images to task templates/instances and track AI verification attempts.

-- CreateEnum
CREATE TYPE "CompletionAttemptStatus" AS ENUM ('APPROVED', 'REJECTED_LOCATION', 'REJECTED_CLEANLINESS', 'ERROR');

-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN "referenceImageUrl" TEXT;

-- AlterTable
ALTER TABLE "TaskInstance" ADD COLUMN "referenceImageUrl" TEXT;

-- CreateTable
CREATE TABLE "TaskCompletionAttempt" (
    "id" SERIAL NOT NULL,
    "taskInstanceId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "locationMatchScore" INTEGER,
    "cleanlinessMatchScore" INTEGER,
    "locationMatchReason" TEXT,
    "cleanlinessReason" TEXT,
    "rawResponse" JSONB,
    "status" "CompletionAttemptStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskCompletionAttempt_taskInstanceId_idx" ON "TaskCompletionAttempt"("taskInstanceId");

-- CreateIndex
CREATE INDEX "TaskCompletionAttempt_staffId_idx" ON "TaskCompletionAttempt"("staffId");

-- AddForeignKey
ALTER TABLE "TaskCompletionAttempt" ADD CONSTRAINT "TaskCompletionAttempt_taskInstanceId_fkey" FOREIGN KEY ("taskInstanceId") REFERENCES "TaskInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskCompletionAttempt" ADD CONSTRAINT "TaskCompletionAttempt_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
