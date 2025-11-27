# 🚀 Guía de Deployment - TomaTurnoModerno v2.7.1

**Versión:** 2.7.1
**Fecha:** Noviembre 27, 2025
**Para:** Equipo DevOps / SysAdmin
**Versión anterior:** v2.7.0

---

## 📋 Resumen del Release

### Cambios en v2.7.1
- Actualización de documentación CLAUDE.md con información de integración LABSIS
- Mejoras en documentación de testing (66 tests, ~70% coverage)
- Actualización de guía de deployment

### Componentes afectados
- Documentación únicamente (sin cambios funcionales)
- No hay migraciones de base de datos nuevas

---

## ⚡ Deployment Rápido (Script Automatizado)

### Opción 1: Usar script de deployment

```bash
# 1. Conectar al servidor
ssh usuario@servidor-produccion

# 2. Ir al directorio de la aplicación
cd /path/to/toma-turno

# 3. Ejecutar script de deployment
# Ajustar variables según ambiente
export APP_DIR="/path/to/toma-turno"
export DB_HOST="localhost"
export DB_NAME="toma_turno"
export DB_USER="labsis"
export DB_PASSWORD="tu-password"
export BACKUP_DIR="$HOME/backups"

# Ejecutar
./scripts/deploy-v2.7.1.sh
```

El script realiza automáticamente:
1. Verificación de prerrequisitos
2. Backup de base de datos
3. Backup del código actual
4. Actualización a v2.7.1
5. Instalación de dependencias
6. Migraciones de BD
7. Build de producción
8. Inicio con PM2
9. Verificaciones de salud

---

## 📝 Deployment Manual (Paso a Paso)

### Pre-requisitos

- [ ] Node.js >= 18.17.0
- [ ] npm >= 9.x
- [ ] PM2 instalado globalmente
- [ ] PostgreSQL >= 14
- [ ] Acceso SSH al servidor
- [ ] Backup de base de datos realizado

### Checklist Pre-Deployment

- [ ] Notificar al equipo del deployment
- [ ] Verificar horario (preferible fuera de 7 AM - 7 PM)
- [ ] Confirmar que hay backup reciente de BD
- [ ] Tener a mano credenciales de acceso

---

### Paso 1: Backup de Base de Datos

```bash
# Crear directorio de backups si no existe
mkdir -p ~/backups

# Crear backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PGPASSWORD='tu-password' pg_dump \
  -h localhost \
  -U labsis \
  -d toma_turno \
  -F c \
  -f ~/backups/toma_turno_pre_v2.7.1_${TIMESTAMP}.dump

# Verificar backup
ls -lh ~/backups/
```

---

### Paso 2: Detener Aplicación

```bash
# Ver estado actual
pm2 status

# Detener aplicación
pm2 stop toma-turno

# Verificar que se detuvo
pm2 status
```

---

### Paso 3: Backup del Código

```bash
cd /path/to/toma-turno

# Crear backup del código actual
cp -r . ~/backups/code_backup_$(date +%Y%m%d_%H%M%S)
```

---

### Paso 4: Actualizar Código

```bash
cd /path/to/toma-turno

# Obtener últimos cambios
git fetch --all --tags

# Cambiar a versión v2.7.1
git checkout v2.7.1

# Verificar versión
cat VERSION
# Debe mostrar: 2.7.1
```

---

### Paso 5: Instalar Dependencias

```bash
# Instalar dependencias de producción
npm ci --production

# Si npm ci falla, usar:
# npm install --production
```

---

### Paso 6: Generar Cliente Prisma

```bash
npx prisma generate
```

---

### Paso 7: Aplicar Migraciones

```bash
# Aplicar migraciones pendientes
npx prisma migrate deploy

# Nota: v2.7.1 no tiene migraciones nuevas
# Este paso es por seguridad
```

---

### Paso 8: Build de Producción

```bash
# Construir aplicación
NODE_ENV=production npm run build

# Verificar que se creó el directorio .next
ls -la .next/
```

---

### Paso 9: Iniciar Aplicación

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Verificar estado
pm2 status

# Ver logs
pm2 logs toma-turno --lines 50
```

---

### Paso 10: Verificación Post-Deployment

```bash
# Health check (ajustar puerto según configuración)
curl http://localhost:$PORT/api/health

# Verificar endpoint de auth
curl http://localhost:$PORT/api/auth/verify

# Guardar configuración PM2
pm2 save
```

---

## ✅ Checklist Post-Deployment

### Verificaciones Funcionales

- [ ] Aplicación accesible en navegador
- [ ] Login funciona correctamente
- [ ] Creación de turnos funciona
- [ ] Cola de turnos visible
- [ ] Estadísticas cargan correctamente
- [ ] Sistema de cubículos funciona
- [ ] TV Display funciona (/turns/queue_video)

### Verificaciones Técnicas

- [ ] PM2 muestra status "online"
- [ ] No hay errores en logs (`pm2 logs toma-turno`)
- [ ] Memoria dentro de límites (`pm2 monit`)
- [ ] Base de datos conectada

---

## 🔄 Procedimiento de Rollback

Si el deployment falla o hay problemas:

### Rollback Rápido (Código)

```bash
# 1. Detener aplicación
pm2 stop toma-turno

# 2. Restaurar código desde backup
cd /path/to/
rm -rf toma-turno
cp -r ~/backups/code_backup_TIMESTAMP toma-turno

# 3. Reinstalar y reconstruir
cd toma-turno
npm ci --production
npx prisma generate
NODE_ENV=production npm run build

# 4. Reiniciar
pm2 start ecosystem.config.js
```

### Rollback de Base de Datos (si es necesario)

```bash
# PRECAUCIÓN: Esto sobrescribirá datos actuales
PGPASSWORD='tu-password' pg_restore \
  -h localhost \
  -U labsis \
  -d toma_turno \
  -c \
  ~/backups/toma_turno_pre_v2.7.1_TIMESTAMP.dump
```

---

## 🔧 Troubleshooting

### Error: "Cannot find module"

```bash
# Limpiar y reinstalar
rm -rf node_modules
rm package-lock.json
npm install --production
npx prisma generate
```

### Error: Prisma Client no generado

```bash
npx prisma generate
npm run build:prod
```

### Error: Puerto en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :$PORT

# Matar proceso si es necesario
kill -9 <PID>
```

### Error: Base de datos no conecta

```bash
# Verificar conexión
psql -h localhost -U labsis -d toma_turno -c "SELECT 1"

# Verificar variable DATABASE_URL
echo $DATABASE_URL
```

### Aplicación no inicia con PM2

```bash
# Ver logs detallados
pm2 logs toma-turno --lines 100

# Reiniciar con modo fork
pm2 delete toma-turno
pm2 start ecosystem.config.js

# Si persiste, iniciar manualmente para debug
NODE_ENV=production npm run start:prod
```

---

## 📊 Monitoreo Post-Deployment

### Comandos útiles PM2

```bash
# Estado general
pm2 status

# Logs en tiempo real
pm2 logs toma-turno

# Monitor interactivo
pm2 monit

# Métricas de memoria/CPU
pm2 info toma-turno
```

### Verificar logs de aplicación

```bash
# Últimas 100 líneas de logs
pm2 logs toma-turno --lines 100

# Buscar errores
pm2 logs toma-turno --lines 500 | grep -i error
```

---

## 📞 Contactos de Soporte

**Desarrollador Principal:** Samuel Quiroz
**Email:** saqh5037@gmail.com

---

## 📎 Archivos Relacionados

- `ecosystem.config.js` - Configuración PM2
- `scripts/deploy-v2.7.1.sh` - Script automatizado de deployment
- `.env.production` - Variables de entorno (no commitear)
- `DEPLOYMENT.md` - Guía general de deployment

---

**Tiempo estimado de deployment:** 5-10 minutos
**Downtime esperado:** < 2 minutos
