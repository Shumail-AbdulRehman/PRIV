-- Remove billing tables and enums added by the now-deleted subscription/billing migration.
-- Uses CASCADE so dependent indexes, constraints, and foreign keys are cleaned up automatically.

DROP TABLE IF EXISTS "UsageRecord" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "PlanFeature" CASCADE;
DROP TABLE IF EXISTS "Feature" CASCADE;
DROP TABLE IF EXISTS "SubscriptionPlan" CASCADE;

DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
DROP TYPE IF EXISTS "BillingCycle" CASCADE;
DROP TYPE IF EXISTS "InvoiceStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
