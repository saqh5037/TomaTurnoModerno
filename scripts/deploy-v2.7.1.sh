#!/bin/bash

#===============================================================================
# SCRIPT DE DEPLOYMENT - TomaTurnoModerno v2.7.1
# Para: Equipo DevOps / SysAdmin INER
# Fecha: Noviembre 2025
#===============================================================================

set -e  # Detener en caso de error

#-------------------------------------------------------------------------------
# CONFIGURACIÓN (ajustar según ambiente)
#-------------------------------------------------------------------------------
APP_NAME="toma-turno"
APP_DIR="${APP_DIR:-/path/to/toma-turno}"  # Ajustar o pasar como variable de entorno
VERSION="v2.7.1"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
LOG_FILE="${BACKUP_DIR}/deploy_${VERSION}_$(date +%Y%m%d_%H%M%S).log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Base de datos (usar variables de entorno)
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-toma_turno}"
DB_USER="${DB_USER:-labsis}"

#-------------------------------------------------------------------------------
# COLORES PARA OUTPUT
#-------------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

#-------------------------------------------------------------------------------
# FUNCIONES DE UTILIDAD
#-------------------------------------------------------------------------------
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗ ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

header() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}  $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

confirm() {
    echo ""
    read -p "$(echo -e ${YELLOW}¿Continuar con el siguiente paso?${NC} [y/N]: )" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warning "Deployment cancelado por el usuario"
        exit 1
    fi
}

#-------------------------------------------------------------------------------
# FUNCIÓN DE ROLLBACK
#-------------------------------------------------------------------------------
rollback() {
    header "INICIANDO ROLLBACK"

    error "El deployment falló. Iniciando proceso de rollback..."

    # Restaurar código si hay backup
    if [ -d "${BACKUP_DIR}/code_backup_${TIMESTAMP}" ]; then
        log "Restaurando código desde backup..."
        rm -rf "$APP_DIR"
        cp -r "${BACKUP_DIR}/code_backup_${TIMESTAMP}" "$APP_DIR"
        success "Código restaurado"
    fi

    # Reiniciar con versión anterior
    log "Reiniciando aplicación con versión anterior..."
    cd "$APP_DIR"
    npm ci --production 2>/dev/null || npm install --production
    npx prisma generate
    npm run build:prod
    pm2 restart $APP_NAME || pm2 start ecosystem.config.js

    warning "Rollback completado. Verifique manualmente el estado de la aplicación."
    warning "Si es necesario, restaure la base de datos desde: ${BACKUP_DIR}/toma_turno_pre_${VERSION}_${TIMESTAMP}.dump"

    exit 1
}

# Trap para ejecutar rollback en caso de error
trap 'rollback' ERR

#-------------------------------------------------------------------------------
# INICIO DEL DEPLOYMENT
#-------------------------------------------------------------------------------
header "DEPLOYMENT TomaTurnoModerno ${VERSION}"

log "Fecha: $(date)"
log "Usuario: $(whoami)"
log "Directorio: $APP_DIR"
log "Log file: $LOG_FILE"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

#-------------------------------------------------------------------------------
# PASO 0: VERIFICAR PRERREQUISITOS
#-------------------------------------------------------------------------------
header "PASO 0: Verificando prerrequisitos"

# Node.js
NODE_VERSION=$(node --version 2>/dev/null || echo "NOT_FOUND")
if [[ "$NODE_VERSION" == "NOT_FOUND" ]]; then
    error "Node.js no está instalado"
    exit 1
fi
success "Node.js: $NODE_VERSION"

# npm
NPM_VERSION=$(npm --version 2>/dev/null || echo "NOT_FOUND")
success "npm: $NPM_VERSION"

# PM2
PM2_VERSION=$(pm2 --version 2>/dev/null || echo "NOT_FOUND")
if [[ "$PM2_VERSION" == "NOT_FOUND" ]]; then
    error "PM2 no está instalado. Instalar con: npm install -g pm2"
    exit 1
fi
success "PM2: $PM2_VERSION"

# PostgreSQL
PG_VERSION=$(psql --version 2>/dev/null || echo "NOT_FOUND")
if [[ "$PG_VERSION" == "NOT_FOUND" ]]; then
    warning "psql no encontrado - backup de BD puede fallar"
else
    success "PostgreSQL client: instalado"
fi

# Verificar directorio de la aplicación
if [ ! -d "$APP_DIR" ]; then
    error "Directorio de aplicación no encontrado: $APP_DIR"
    error "Ajuste la variable APP_DIR en el script o pásela como variable de entorno"
    exit 1
fi
success "Directorio de aplicación: $APP_DIR"

confirm

#-------------------------------------------------------------------------------
# PASO 1: BACKUP DE BASE DE DATOS
#-------------------------------------------------------------------------------
header "PASO 1: Backup de base de datos"

log "Creando backup de la base de datos..."
DB_BACKUP_FILE="${BACKUP_DIR}/toma_turno_pre_${VERSION}_${TIMESTAMP}.dump"

if command -v pg_dump &> /dev/null; then
    if PGPASSWORD="${DB_PASSWORD}" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -F c -f "$DB_BACKUP_FILE" 2>/dev/null; then
        success "Backup creado: $DB_BACKUP_FILE"
        log "Tamaño: $(ls -lh $DB_BACKUP_FILE | awk '{print $5}')"
    else
        warning "No se pudo crear backup automático de BD"
        warning "Asegúrese de tener un backup manual antes de continuar"
    fi
else
    warning "pg_dump no disponible - crear backup manual de BD"
fi

confirm

#-------------------------------------------------------------------------------
# PASO 2: DETENER APLICACIÓN
#-------------------------------------------------------------------------------
header "PASO 2: Deteniendo aplicación"

log "Deteniendo $APP_NAME con PM2..."
pm2 stop $APP_NAME 2>/dev/null || warning "La aplicación no estaba corriendo"
success "Aplicación detenida"

#-------------------------------------------------------------------------------
# PASO 3: BACKUP DEL CÓDIGO
#-------------------------------------------------------------------------------
header "PASO 3: Backup del código actual"

log "Creando backup del código..."
CODE_BACKUP="${BACKUP_DIR}/code_backup_${TIMESTAMP}"
cp -r "$APP_DIR" "$CODE_BACKUP"
success "Backup creado: $CODE_BACKUP"

#-------------------------------------------------------------------------------
# PASO 4: ACTUALIZAR CÓDIGO
#-------------------------------------------------------------------------------
header "PASO 4: Actualizando código a ${VERSION}"

cd "$APP_DIR"

log "Obteniendo últimos cambios..."
git fetch --all --tags

log "Cambiando a versión ${VERSION}..."
git checkout ${VERSION}

success "Código actualizado a ${VERSION}"
log "Commit actual: $(git log -1 --oneline)"

confirm

#-------------------------------------------------------------------------------
# PASO 5: INSTALAR DEPENDENCIAS
#-------------------------------------------------------------------------------
header "PASO 5: Instalando dependencias"

log "Ejecutando npm ci --production..."
npm ci --production

success "Dependencias instaladas"

#-------------------------------------------------------------------------------
# PASO 6: GENERAR CLIENTE PRISMA
#-------------------------------------------------------------------------------
header "PASO 6: Generando cliente Prisma"

log "Ejecutando prisma generate..."
npx prisma generate

success "Cliente Prisma generado"

#-------------------------------------------------------------------------------
# PASO 7: APLICAR MIGRACIONES
#-------------------------------------------------------------------------------
header "PASO 7: Aplicando migraciones de base de datos"

log "Ejecutando prisma migrate deploy..."
npx prisma migrate deploy

success "Migraciones aplicadas"

confirm

#-------------------------------------------------------------------------------
# PASO 8: BUILD DE PRODUCCIÓN
#-------------------------------------------------------------------------------
header "PASO 8: Construyendo aplicación para producción"

log "Ejecutando build de producción..."
NODE_ENV=production npm run build

success "Build completado"

#-------------------------------------------------------------------------------
# PASO 9: VERIFICAR VARIABLES DE ENTORNO
#-------------------------------------------------------------------------------
header "PASO 9: Verificando variables de entorno"

# Verificar que exista archivo de configuración
if [ -f ".env.production" ]; then
    success "Archivo .env.production encontrado"
elif [ -f ".env" ]; then
    success "Archivo .env encontrado"
else
    warning "No se encontró archivo de variables de entorno"
    warning "Asegúrese de que las variables estén configuradas en el sistema"
fi

# Verificar variables críticas
if [ -z "$DATABASE_URL" ] && [ -f ".env.production" ]; then
    if grep -q "DATABASE_URL" .env.production; then
        success "DATABASE_URL configurada en .env.production"
    else
        warning "DATABASE_URL no encontrada"
    fi
fi

confirm

#-------------------------------------------------------------------------------
# PASO 10: INICIAR APLICACIÓN
#-------------------------------------------------------------------------------
header "PASO 10: Iniciando aplicación"

log "Iniciando con PM2..."
pm2 start ecosystem.config.js --env production

# Esperar a que inicie
sleep 5

# Verificar estado
pm2 status $APP_NAME

success "Aplicación iniciada"

#-------------------------------------------------------------------------------
# PASO 11: VERIFICACIÓN DE SALUD
#-------------------------------------------------------------------------------
header "PASO 11: Verificación de salud"

log "Esperando 10 segundos para que la aplicación se estabilice..."
sleep 10

# Obtener puerto de las variables de entorno o ecosystem.config.js
APP_PORT=${PORT:-$(node -e "console.log(require('./ecosystem.config.js').apps[0].env.PORT || 3000)")}

log "Verificando endpoint de salud en puerto $APP_PORT..."

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${APP_PORT}/api/health" 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" == "200" ]; then
    success "Health check: OK (HTTP 200)"
else
    warning "Health check retornó: HTTP $HEALTH_CHECK"
    warning "Verificar logs con: pm2 logs $APP_NAME"
fi

#-------------------------------------------------------------------------------
# PASO 12: TESTS FUNCIONALES BÁSICOS
#-------------------------------------------------------------------------------
header "PASO 12: Tests funcionales básicos"

log "Verificando endpoint de autenticación..."
AUTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${APP_PORT}/api/auth/verify" 2>/dev/null || echo "000")
if [ "$AUTH_CHECK" == "401" ] || [ "$AUTH_CHECK" == "200" ]; then
    success "Endpoint de autenticación: OK"
else
    warning "Endpoint de autenticación: HTTP $AUTH_CHECK"
fi

log "Verificando página principal..."
MAIN_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${APP_PORT}/" 2>/dev/null || echo "000")
if [ "$MAIN_CHECK" == "200" ]; then
    success "Página principal: OK"
else
    warning "Página principal: HTTP $MAIN_CHECK"
fi

#-------------------------------------------------------------------------------
# PASO 13: GUARDAR CONFIGURACIÓN PM2
#-------------------------------------------------------------------------------
header "PASO 13: Guardando configuración PM2"

log "Guardando estado de PM2..."
pm2 save

success "Configuración PM2 guardada"

#-------------------------------------------------------------------------------
# RESUMEN FINAL
#-------------------------------------------------------------------------------
header "DEPLOYMENT COMPLETADO"

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✓ DEPLOYMENT ${VERSION} COMPLETADO EXITOSAMENTE            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "Resumen:"
log "  - Versión: ${VERSION}"
log "  - Backup BD: ${DB_BACKUP_FILE}"
log "  - Backup código: ${CODE_BACKUP}"
log "  - Log completo: ${LOG_FILE}"

echo ""
echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
echo "  1. Verificar funcionamiento en navegador"
echo "  2. Probar login con usuario de prueba"
echo "  3. Crear un turno de prueba"
echo "  4. Verificar estadísticas"
echo "  5. Monitorear logs: pm2 logs $APP_NAME"
echo ""

echo -e "${CYAN}Comandos útiles:${NC}"
echo "  pm2 status          - Ver estado de la aplicación"
echo "  pm2 logs $APP_NAME  - Ver logs en tiempo real"
echo "  pm2 monit           - Monitor interactivo"
echo ""

success "¡Deployment completado!"
