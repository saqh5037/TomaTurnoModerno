#!/usr/bin/env bash
# Deploy script for v2.8.66 to the INER server.
#
# Hotfix: /api/cubicles/status used its own PrismaClient and called $disconnect()
# on every request; concurrent 5-second polling from the tablets raced the
# disconnect and left the engine stuck in "Engine is not yet connected", so the
# cubicle dropdown in the attention panel stayed empty until the daily PM2
# restart. Reported by INER support on 2026-11-09.
#
# Usage (from your machine, NOT on the server):
#   bash scripts/deploy-v2.8.66.sh
#
# Prerequisites:
#   - SSH access to 192.168.2.190:2278 as dynamtek
#   - Branch fix/investigacion-reportes-20260505 already pushed to origin with
#     the hotfix merged (commit 2791b68)
#
# Rollback (code-only release, no migrations):
#   ssh -p 2278 dynamtek@192.168.2.190 'cd /home/dynamtek/toma-turno-moderno && \
#     git checkout 7e3b1eb && npm run build:prod && pm2 restart toma-turno'

set -euo pipefail

REMOTE_HOST="dynamtek@192.168.2.190"
REMOTE_PORT="2278"
REMOTE_DIR="/home/dynamtek/toma-turno-moderno"
REMOTE_BRANCH="fix/investigacion-reportes-20260505"
BACKUP_DIR="/home/dynamtek/backups"
TS=$(date +%Y%m%d_%H%M%S)

echo "════════════════════════════════════════════════════════════"
echo "  DEPLOY v2.8.66 → INER (${REMOTE_HOST})"
echo "  Branch: ${REMOTE_BRANCH}"
echo "  Commit: 2791b68"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Steps: DB backup → git pull → prisma generate → build → PM2 restart → health check"
echo "No schema changes in this release."
echo ""
read -rp "Continue? (type 'deploy' to proceed): " confirm
if [[ "$confirm" != "deploy" ]]; then
  echo "Cancelled."
  exit 0
fi

ssh -p "${REMOTE_PORT}" "${REMOTE_HOST}" bash <<EOF
set -euo pipefail
cd ${REMOTE_DIR}

echo ""
echo "[1/5] DB backup (safety net, no migrations in this release)..."
mkdir -p ${BACKUP_DIR}
source .env 2>/dev/null || true
pg_dump "\${DATABASE_URL}" > ${BACKUP_DIR}/toma_turno_pre_v2.8.66_${TS}.sql
echo "    OK → ${BACKUP_DIR}/toma_turno_pre_v2.8.66_${TS}.sql"

echo ""
echo "[2/5] Git pull..."
git fetch origin
git checkout ${REMOTE_BRANCH}
git pull --ff-only origin ${REMOTE_BRANCH}
echo "    HEAD: \$(git log --oneline -1)"

echo ""
echo "[3/5] Prisma client..."
npx prisma generate

echo ""
echo "[4/5] Production build..."
npm install --production=false
npm run build:prod
echo "    OK → build complete"

echo ""
echo "[5/5] PM2 restart..."
pm2 restart toma-turno
sleep 5
pm2 status toma-turno

echo ""
echo "  Health checks:"
curl -fsS http://localhost:3000/api/queue/list > /dev/null \
  && echo "    /api/queue/list → 200 OK" \
  || echo "    ALERT: /api/queue/list not responding"
STATUS_BODY=\$(curl -fsS http://localhost:3000/api/cubicles/status || echo "")
if echo "\${STATUS_BODY}" | grep -q '"success":true'; then
  echo "    /api/cubicles/status → 200 OK with success:true (hotfix target)"
else
  echo "    ALERT: /api/cubicles/status did not return success:true"
  echo "    body: \${STATUS_BODY:0:200}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  DEPLOY v2.8.66 COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo "  DB backup: ${BACKUP_DIR}/toma_turno_pre_v2.8.66_${TS}.sql"
echo "  Version shown on login screen: v2.8.66"
EOF
