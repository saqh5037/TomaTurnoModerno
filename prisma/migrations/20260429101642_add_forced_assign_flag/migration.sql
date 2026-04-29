-- v2.8.52: Flag para distinguir asignaciones manuales del admin de las automáticas
-- Si forcedAssign=true, el sistema NO debe hacer swap por prioridad ni liberar por timeout.
-- Lo setea /api/admin/assign-patient. Lo respeta lib/holdingUtils.js (assignNextHolding y releaseExpiredHoldings).

-- AlterTable
ALTER TABLE "TurnRequest" ADD COLUMN IF NOT EXISTS "forcedAssign" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TurnRequest_forcedAssign_idx" ON "TurnRequest"("forcedAssign");
