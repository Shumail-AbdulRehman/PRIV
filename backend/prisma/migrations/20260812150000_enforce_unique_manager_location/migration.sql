-- Enforce exclusive location assignment: a location can be assigned to at most one manager.

ALTER TABLE "ManagerLocation" ADD CONSTRAINT "ManagerLocation_locationId_key" UNIQUE ("locationId");
