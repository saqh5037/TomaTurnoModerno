-- v2.8.54: Tablas para control de emergencia de llamados y logging de integración Labsis
-- SystemState: almacena estado global del sistema (ej. llamados pausados)
-- LabsisInboundLog: trazabilidad de requests entrantes de Labsis para reprocesamiento

-- CreateTable SystemState
CREATE TABLE IF NOT EXISTS "SystemState" (
    id SERIAL NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "SystemState_pkey" PRIMARY KEY (id)
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SystemState_key_key" ON "SystemState"(key);

-- CreateTable LabsisInboundLog
CREATE TABLE IF NOT EXISTS "LabsisInboundLog" (
    id SERIAL NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "turnId" INTEGER,

    CONSTRAINT "LabsisInboundLog_pkey" PRIMARY KEY (id)
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LabsisInboundLog_status_idx" ON "LabsisInboundLog"(status);
CREATE INDEX IF NOT EXISTS "LabsisInboundLog_createdAt_idx" ON "LabsisInboundLog"("createdAt");
