/*
  Warnings:

  - A unique constraint covering the columns `[staffId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[templateId,date]` on the table `TaskInstance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attendance_staffId_date_key" ON "Attendance"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TaskInstance_templateId_date_key" ON "TaskInstance"("templateId", "date");
