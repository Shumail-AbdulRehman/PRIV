-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'STARTED', 'COMPLETED', 'MISSED', 'FAILED', 'REASSIGNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" SERIAL NOT NULL,
    "taskInstanceId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "reason" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "actorType" TEXT NOT NULL,
    "actorId" INTEGER,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskAssignment_taskInstanceId_idx" ON "TaskAssignment"("taskInstanceId");

-- CreateIndex
CREATE INDEX "TaskAssignment_taskInstanceId_isCurrent_idx" ON "TaskAssignment"("taskInstanceId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_one_current_per_task_idx" ON "TaskAssignment"("taskInstanceId") WHERE "isCurrent" = true;

-- CreateIndex
CREATE INDEX "TaskAssignment_staffId_idx" ON "TaskAssignment"("staffId");

-- CreateIndex
CREATE INDEX "TaskAssignment_staffId_isCurrent_idx" ON "TaskAssignment"("staffId", "isCurrent");

-- CreateIndex
CREATE INDEX "TaskAssignment_status_idx" ON "TaskAssignment"("status");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskInstanceId_fkey" FOREIGN KEY ("taskInstanceId") REFERENCES "TaskInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
