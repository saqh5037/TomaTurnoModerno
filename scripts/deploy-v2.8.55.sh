#!/usr/bin/env bash
# Deploy script para v2.8.55 al servidor INER.
#
# Fix: routing RiesgoCaida a cubículos GENERAL + validación blanda asignación manual.
# Bug reportado por Brenda/Carlos el 13-may-2026.
#
# Uso (desde tu máquina, NO en servidor):
#   bash scripts/deploy-v2.8.55.sh
#
# Pre-requisitos:
#   - Acceso SSH a 192.168.2.190:2278 con user dynamtek
#   - Branch fix/investigacion-reportes-20260505 ya pusheado a origin (commit 85bd6fd)

set -euo pipefail

REMOTE_HOST="dynamtek@192.168.2.190"
REMOTE_PORT="2278"
REMOTE_DIR="/home/dynamtek/toma-turno-moderno"
REMOTE_BRANCH="fix/investigacion-reportes-20260505"
BACKUP_DIR="/home/dynamtek/backups"
TS=$(date +%Y%m%d_%H%M%S)

echo "════════════════════════════════════════════════════════════"
echo "  DEPLOY v2.8.55 → INER (${REMOTE_HOST})"
echo "  Branch: ${REMOTE_BRANCH}"
echo "  Commit: 85bd6fd"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Pasos: backup DB → git pull → prisma generate → build → restart PM2 → health check"
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
echo "[1/5] Backup de DB..."
mkdir -p ${BACKUP_DIR}
source .env 2>/dev/null || true
pg_dump "\${DATABASE_URL}" > ${BACKUP_DIR}/toma_turno_pre_v2.8.55_${TS}.sql
echo "    OK → ${BACKUP_DIR}/toma_turno_pre_v2.8.55_${TS}.sql"

echo ""
echo "[2/5] Git pull..."
git fetch origin
git checkout ${REMOTE_BRANCH}
git pull origin ${REMOTE_BRANCH}
echo "    HEAD: \$(git log --oneline -1)"

echo ""
echo "[3/5] Generando cliente Prisma..."
npx prisma generate
# Sin migraciones nuevas en v2.8.55 — solo bugfix de lógica.

echo ""
echo "[4/5] Build producción..."
npm install --production=false
npm run build:prod
echo "    OK → build completo"

echo ""
echo "[5/5] Restart PM2..."
pm2 restart toma-turno
sleep 3
pm2 status toma-turno

echo ""
echo "  Health check:"
curl -fsS http://localhost:3000/api/queue/list > /dev/null && echo "    /api/queue/list → 200 OK" || echo "    ALERTA: API no responde"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  DEPLOY v2.8.55 COMPLETO"
echo "════════════════════════════════════════════════════════════"
echo "  Backup DB: ${BACKUP_DIR}/toma_turno_pre_v2.8.55_${TS}.sql"
echo ""
echo "Validación con Carlos/Brenda:"
echo "  1. Asignar paciente RiesgoCaida → debe aparecer en cola de flebos en cubs 1, 2 (GENERAL)."
echo "  2. Modal admin: dropdown muestra [GENERAL]/[SPECIAL] en cada flebotomista."
echo "  3. Si solo hay 1 flebo activo, sale hint pidiendo login del resto."
echo "  4. Asignar MuyEspecial a cub GENERAL → modal muestra warning + checkbox override."
EOF
