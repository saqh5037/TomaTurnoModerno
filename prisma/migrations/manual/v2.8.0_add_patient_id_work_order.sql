-- Migration v2.8.0: Add patientID and workOrder fields
-- Date: 2026-01-09
-- Description: Adds patient identification and work order fields from HIS integration

-- ============================================
-- IMPORTANT: Run this BEFORE deploying v2.8.0
-- ============================================

-- 1. Add new columns to TurnRequest table (if not exist)
-- These columns store patient identification data from HIS

DO $$
BEGIN
    -- Add patient_id column (CI/Expediente del paciente)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'TurnRequest' AND column_name = 'patient_id'
    ) THEN
        ALTER TABLE "TurnRequest" ADD COLUMN "patient_id" TEXT;
        RAISE NOTICE 'Column patient_id added to TurnRequest';
    ELSE
        RAISE NOTICE 'Column patient_id already exists';
    END IF;

    -- Add work_order column (Número de orden de trabajo)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'TurnRequest' AND column_name = 'work_order'
    ) THEN
        ALTER TABLE "TurnRequest" ADD COLUMN "work_order" TEXT;
        RAISE NOTICE 'Column work_order added to TurnRequest';
    ELSE
        RAISE NOTICE 'Column work_order already exists';
    END IF;

    -- Add holdingBy column (for holding system)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'TurnRequest' AND column_name = 'holdingBy'
    ) THEN
        ALTER TABLE "TurnRequest" ADD COLUMN "holdingBy" INTEGER;
        RAISE NOTICE 'Column holdingBy added to TurnRequest';
    ELSE
        RAISE NOTICE 'Column holdingBy already exists';
    END IF;

    -- Add holdingAt column (timestamp for holding timeout)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'TurnRequest' AND column_name = 'holdingAt'
    ) THEN
        ALTER TABLE "TurnRequest" ADD COLUMN "holdingAt" TIMESTAMP(3);
        RAISE NOTICE 'Column holdingAt added to TurnRequest';
    ELSE
        RAISE NOTICE 'Column holdingAt already exists';
    END IF;
END $$;

-- 2. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "TurnRequest_holdingBy_idx" ON "TurnRequest"("holdingBy");
CREATE INDEX IF NOT EXISTS "TurnRequest_status_holdingBy_idx" ON "TurnRequest"("status", "holdingBy");

-- 3. Add foreign key constraint for holdingBy -> User
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'TurnRequest_holdingBy_fkey'
    ) THEN
        ALTER TABLE "TurnRequest"
        ADD CONSTRAINT "TurnRequest_holdingBy_fkey"
        FOREIGN KEY ("holdingBy") REFERENCES "User"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Foreign key TurnRequest_holdingBy_fkey added';
    ELSE
        RAISE NOTICE 'Foreign key TurnRequest_holdingBy_fkey already exists';
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================

-- Verify columns exist:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'TurnRequest' AND column_name IN ('patient_id', 'work_order', 'holdingBy', 'holdingAt');

-- Verify indexes exist:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'TurnRequest' AND indexname LIKE '%holding%';

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- To rollback these changes:
-- ALTER TABLE "TurnRequest" DROP CONSTRAINT IF EXISTS "TurnRequest_holdingBy_fkey";
-- DROP INDEX IF EXISTS "TurnRequest_holdingBy_idx";
-- DROP INDEX IF EXISTS "TurnRequest_status_holdingBy_idx";
-- ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "patient_id";
-- ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "work_order";
-- ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "holdingBy";
-- ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "holdingAt";
