import { prisma } from '../../prisma/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const requiredColumns = ['spatialEvidence', 'spatialDecision', 'spatialVersion'];
export async function verificationSchemaReadiness() {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'VerificationAttempt'
      AND column_name IN ('spatialEvidence', 'spatialDecision', 'spatialVersion')`;
  const missingColumns = requiredColumns.filter(name => !rows.some(row => row.column_name === name));
  return { ready: missingColumns.length === 0, missingColumns,
    requiredMigration: missingColumns.length ? '202610070001_spatial_observations' : null };
}

// Recheck after deployment without restarting; a failed query is never cached as ready.
let checked: { until: number; result: Awaited<ReturnType<typeof verificationSchemaReadiness>> } | undefined;
export async function requireVerificationSchema() {
  if (!checked || checked.until <= Date.now()) {
    checked = { result: await verificationSchemaReadiness(), until: Date.now() + 15000 };
  }
  if (!checked.result.ready) throw new ApiError(503,
    'Task photos are temporarily unavailable because the server database update is pending. Your saved photos are kept. Ask your manager to contact support.',
    [{ code: 'VERIFICATION_SCHEMA_NOT_READY', requiredMigration: checked.result.requiredMigration }]);
}
