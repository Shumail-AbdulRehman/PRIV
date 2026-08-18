-- AlterTable
ALTER TABLE "TaskCompletionAttempt" ADD COLUMN     "areaName" TEXT,
ADD COLUMN     "submissionId" TEXT;

-- CreateTable
CREATE TABLE "TaskTemplateReferenceImage" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskTemplateReferenceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskInstanceReferenceImage" (
    "id" SERIAL NOT NULL,
    "taskInstanceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskInstanceReferenceImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskTemplateReferenceImage_templateId_idx" ON "TaskTemplateReferenceImage"("templateId");

-- CreateIndex
CREATE INDEX "TaskInstanceReferenceImage_taskInstanceId_idx" ON "TaskInstanceReferenceImage"("taskInstanceId");

-- AddForeignKey
ALTER TABLE "TaskTemplateReferenceImage" ADD CONSTRAINT "TaskTemplateReferenceImage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskInstanceReferenceImage" ADD CONSTRAINT "TaskInstanceReferenceImage_taskInstanceId_fkey" FOREIGN KEY ("taskInstanceId") REFERENCES "TaskInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

