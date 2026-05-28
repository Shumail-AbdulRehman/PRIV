-- CreateIndex
CREATE INDEX "Attendance_locationId_date_idx" ON "Attendance"("locationId", "date");

-- CreateIndex
CREATE INDEX "Attendance_staffId_idx" ON "Attendance"("staffId");

-- CreateIndex
CREATE INDEX "Location_companyId_idx" ON "Location"("companyId");

-- CreateIndex
CREATE INDEX "Location_isActive_idx" ON "Location"("isActive");

-- CreateIndex
CREATE INDEX "Staff_companyId_idx" ON "Staff"("companyId");

-- CreateIndex
CREATE INDEX "Staff_locationId_idx" ON "Staff"("locationId");

-- CreateIndex
CREATE INDEX "Staff_isActive_idx" ON "Staff"("isActive");

-- CreateIndex
CREATE INDEX "TaskInstance_locationId_isActive_date_idx" ON "TaskInstance"("locationId", "isActive", "date");

-- CreateIndex
CREATE INDEX "TaskInstance_locationId_status_idx" ON "TaskInstance"("locationId", "status");

-- CreateIndex
CREATE INDEX "TaskTemplate_locationId_idx" ON "TaskTemplate"("locationId");

-- CreateIndex
CREATE INDEX "TaskTemplate_isActive_idx" ON "TaskTemplate"("isActive");
