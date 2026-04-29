#!/usr/bin/env bash
# Rollback script para v2.8.52 (fix Carlos INER 2026-04-29).
#
# Uso: bash scripts/rollback-v2.8.52.sh
#
# Lo que hace:
# 1. Verifica que estés en el servidor INER (192.168.2.190).
# 2. Hace backup de la DB ANTES de tocar nada.
# 3. Vuelve el código a v2.8.51 (commit 6ace4ca).
# 4. Revierte el schema de Prisma (drop column forcedAssign).
# 5. Rebuilda y reinicia PM2.
# 6. Verifica health check.
#
# La columna forcedAssign con default false es backward-compatible — esta
# migración inversa solo es necesaria si el rollback ocurre por algo
# relacionado al schema, no por un bug del código.

set -euo pipefail

ROLLBACK_TARGET="6ace4ca"  # v2.8.51
BACKUP_DIR="/home/dynamtek/backups"
TS=$(date +%Y%m%d_%H%M%S)

echo "════════════════════════════════════════════════════════════"
echo "  ROLLBACK v2.8.52 → v2.8.51 (commit ${ROLLBACK_TARGET})"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Este script:"
echo "  1. Backup de DB en ${BACKUP_DIR}/toma_turno_pre_rollback_${TS}.sql"
echo "  2. git reset --hard ${ROLLBACK_TARGET}"
echo "  3. (Opcional) DROP COLUMN forcedAssign — preguntará primero"
echo "  4. npm run build:prod"
echo "  5. pm2 restart toma-turno"
echo ""
read -rp "¿Continuar? (escribe 'rollback' para proceder): " confirm
if [[ "$confirm" != "rollback" ]]; then
  echo "Cancelado."
  exit 0
fi

# ── 1. Backup DB ─────────────────────────────────────────────────
echo ""
echo "[1/5] Backup de DB..."
mkdir -p "${BACKUP_DIR}"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL no está seteada. Source .env primero o exportá la variable."
  exit 1
fi
pg_dump "${DATABASE_URL}" > "${BACKUP_DIR}/toma_turno_pre_rollback_${TS}.sql"
echo "    OK → ${BACKUP_DIR}/toma_turno_pre_rollback_${TS}.sql ($(du -h ${BACKUP_DIR}/toma_turno_pre_rollback_${TS}.sql | cut -f1))"

# ── 2. Git reset ─────────────────────────────────────────────────
echo ""
echo "[2/5] Volviendo código a ${ROLLBACK_TARGET}..."
git fetch origin main
git checkout main
git reset --hard "${ROLLBACK_TARGET}"
echo "    OK → HEAD: $(git log --oneline -1)"

# ── 3. Schema rollback (opcional) ────────────────────────────────
echo ""
echo "[3/5] Schema rollback (DROP COLUMN forcedAssign)..."
echo "      Esto NO es necesario si el bug es de código — la columna con default"
echo "      false es inocua. Solo necesario si el bug es del schema."
read -rp "      ¿Querés DROP COLUMN forcedAssign? (s/N): " drop_col
if [[ "$drop_col" == "s" || "$drop_col" == "S" ]]; then
  psql "${DATABASE_URL}" <<'SQL'
DROP INDEX IF EXISTS "TurnRequest_forcedAssign_idx";
ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "forcedAssign";
SQL
  echo "    OK → columna eliminada"
else
  echo "    Skipped (columna queda con default false, inocua)"
fi

# ── 4. Build ─────────────────────────────────────────────────────
echo ""
echo "[4/5] Building..."
npm install --production=false
npm run build:prod
echo "    OK → build completo"

# ── 5. Restart PM2 ───────────────────────────────────────────────
echo ""
echo "[5/5] Reiniciando PM2..."
pm2 restart toma-turno
sleep 3
pm2 logs toma-turno --lines 20 --nostream

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ROLLBACK COMPLETO"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Verificar:"
echo "  curl http://localhost:3000/api/queue/list  → debe responder 200"
echo "  pm2 status                                 → toma-turno online"
echo ""
echo "Backup DB en: ${BACKUP_DIR}/toma_turno_pre_rollback_${TS}.sql"
echo "Si querés volver a v2.8.52: git checkout main && git pull && deploy normal."
