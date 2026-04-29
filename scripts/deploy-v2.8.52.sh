#!/usr/bin/env bash
# Deploy script para v2.8.52 al servidor INER.
#
# Uso (desde tu máquina, NO en servidor):
#   bash scripts/deploy-v2.8.52.sh
#
# Pre-requisitos:
#   - Acceso SSH a 192.168.2.190:2278 con user dynamtek
#   - Branch fix/v2.8.52-iner-stable-calls ya pusheado a origin
#   - PR mergeado a main (o cambia REMOTE_BRANCH abajo)

set -euo pipefail

REMOTE_HOST="dynamtek@192.168.2.190"
REMOTE_PORT="2278"
REMOTE_DIR="/home/dynamtek/toma-turno-moderno"
REMOTE_BRANCH="main"  # cambiar a "fix/v2.8.52-iner-stable-calls" si vas sin merge a main
BACKUP_DIR="/home/dynamtek/backups"
TS=$(date +%Y%m%d_%H%M%S)

echo "════════════════════════════════════════════════════════════"
echo "  DEPLOY v2.8.52 → INER (${REMOTE_HOST})"
echo "  Branch: ${REMOTE_BRANCH}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Pasos: backup DB → git pull → migrate → build → restart PM2 → health check"
echo ""
read -rp "¿Continuar? (escribe 'deploy' para proceder): " confirm
if [[ "$confirm" != "deploy" ]]; then
  echo "Cancelado."
  exit 0
fi

ssh -p "${REMOTE_PORT}" "${REMOTE_HOST}" bash <<EOF
set -euo pipefail
cd ${REMOTE_DIR}

echo ""
echo "[1/6] Backup de DB..."
mkdir -p ${BACKUP_DIR}
source .env 2>/dev/null || true
pg_dump "\${DATABASE_URL}" > ${BACKUP_DIR}/toma_turno_pre_v2.8.52_${TS}.sql
echo "    OK → ${BACKUP_DIR}/toma_turno_pre_v2.8.52_${TS}.sql"

echo ""
echo "[2/6] Git pull..."
git fetch origin
git checkout ${REMOTE_BRANCH}
git pull origin ${REMOTE_BRANCH}
echo "    HEAD: \$(git log --oneline -1)"

echo ""
echo "[3/6] Aplicando migration..."
psql "\${DATABASE_URL}" -f prisma/migrations/20260429101642_add_forced_assign_flag/migration.sql
echo "    OK → columna forcedAssign aplicada (idempotente)"

echo ""
echo "[4/6] Generando cliente Prisma..."
npx prisma generate

echo ""
echo "[5/6] Build producción..."
npm install --production=false
npm run build:prod
echo "    OK → build completo"

echo ""
echo "[6/6] Restart PM2..."
pm2 restart toma-turno
sleep 3
pm2 status toma-turno

echo ""
echo "  Health check:"
curl -fsS http://localhost:3000/api/queue/list > /dev/null && echo "    /api/queue/list → 200 OK" || echo "    ALERTA: API no responde"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  DEPLOY COMPLETO"
echo "════════════════════════════════════════════════════════════"
echo "  Backup DB: ${BACKUP_DIR}/toma_turno_pre_v2.8.52_${TS}.sql"
echo "  Rollback:  bash scripts/rollback-v2.8.52.sh"
echo ""
echo "Avisar a Carlos: probar asignación admin + observar TV en hora pico."
EOF
