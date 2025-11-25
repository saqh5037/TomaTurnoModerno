# 🚀 Guía de Deployment - TomaTurnoModerno v2.7.0

**Versión:** 2.7.0
**Fecha:** 24 de Noviembre de 2025
**Última actualización:** 24/11/2025
**Para:** Equipo DevOps / SysAdmin

---

## 📋 Información General

### Servidor de Producción
- **Host:** AWS EC2 (ec2-3-91-26-178.compute-1.amazonaws.com)
- **IP Pública:** 52.55.189.120
- **Sistema Operativo:** Ubuntu/Linux
- **Node.js:** >= 18.17.0
- **PostgreSQL:** >= 14
- **Process Manager:** PM2
- **Puerto Aplicación:** 3005 (CRÍTICO - NO CAMBIAR)

### URLs de Acceso
- **Producción:** http://tomaturno.52.55.189.120.nip.io
- **Base de Datos:** postgresql://labsis:***@ec2-3-91-26-178.compute-1.amazonaws.com:5432/toma_turno

---

## ⚠️ IMPORTANTE: Puerto 3005

**CRÍTICO:** La aplicación DEBE ejecutarse en el puerto **3005**.

Este puerto está configurado en:
- Infraestructura de red (firewall/proxy)
- Variables de entorno de producción
- Configuración PM2 (ecosystem.config.js)
- Documentación y referencias del sistema

**NO cambiar el puerto sin coordinación previa con el equipo de infraestructura.**

---

## 📦 Pre-requisitos de Deployment

### 1. Verificar Requisitos del Sistema

```bash
# Verificar versión de Node.js
node --version  # Debe ser >= 18.17.0

# Verificar versión de npm
npm --version   # Debe ser >= 9.x

# Verificar PostgreSQL
psql --version  # Debe ser >= 14

# Verificar PM2
pm2 --version   # Si no está instalado: npm install -g pm2
```

### 2. Verificar Acceso SSH

```bash
# Conectar al servidor (ajustar según tu configuración)
ssh usuario@ec2-3-91-26-178.compute-1.amazonaws.com

# O usando alias
ssh toma-turno-prod
```

### 3. Verificar Permisos

Asegurarse de tener:
- Acceso SSH al servidor
- Permisos de escritura en directorio de la aplicación
- Acceso a variables de entorno (.env.production)
- Permisos para reiniciar servicios (PM2)

---

## 🔧 Proceso de Deployment v2.7.0

### Paso 1: Backup Pre-Deployment

```bash
# Conectar al servidor
ssh usuario@ec2-3-91-26-178.compute-1.amazonaws.com

# Navegar al directorio de la aplicación
cd /path/to/toma-turno

# Crear backup de la base de datos
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PGPASSWORD='tu-password' pg_dump \
  -h localhost \
  -U labsis \
  -d toma_turno \
  -F c \
  -f ~/backups/toma_turno_pre_v2.7.0_${TIMESTAMP}.dump

# Verificar que el backup se creó
ls -lh ~/backups/

# Crear backup del código actual
cd /path/to/toma-turno
tar -czf ~/backups/toma-turno_code_${TIMESTAMP}.tar.gz .

echo "✅ Backups creados exitosamente"
```

### Paso 2: Detener la Aplicación

```bash
# Verificar estado actual de PM2
pm2 status

# Detener la aplicación
pm2 stop toma-turno

# Verificar que se detuvo
pm2 status
# Debe aparecer como "stopped"

echo "✅ Aplicación detenida"
```

### Paso 3: Actualizar el Código

```bash
# Navegar al directorio de la aplicación
cd /path/to/toma-turno

# Guardar cambios locales si existen (opcional)
git stash

# Actualizar desde GitHub
git fetch origin
git checkout main
git pull origin main

# Verificar que se descargó la versión correcta
git describe --tags
# Debe mostrar: v2.7.0

# Ver últimos commits
git log --oneline -5

echo "✅ Código actualizado a v2.7.0"
```

### Paso 4: Instalar Dependencias

```bash
# Limpiar node_modules anterior (recomendado para major updates)
rm -rf node_modules package-lock.json

# Instalar dependencias de producción
npm ci --production

# O si quieres instalar todas (incluyendo devDependencies para tests)
npm ci

# Verificar instalación
npm list --depth=0

echo "✅ Dependencias instaladas"
```

### Paso 5: Actualizar Base de Datos

```bash
# Generar cliente Prisma actualizado
npx prisma generate

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Verificar estado de migraciones
npx prisma migrate status

# Debería mostrar:
# "Database schema is up to date!"

echo "✅ Base de datos actualizada"
```

### Paso 6: Ejecutar Migración de Datos (OPCIONAL)

⚠️ **OPCIONAL:** Solo si deseas convertir datos legacy a formato estructurado LABSIS.

```bash
# Preview de la migración (sin modificar BD)
node scripts/migrate-studies-to-structured-format.js

# Revisar el output. Si todo se ve bien:

# Ejecutar migración real
node scripts/migrate-studies-to-structured-format.js --execute

# Verificar resultados
echo "SELECT COUNT(*) FROM \"TurnRequest\" WHERE studies_json IS NOT NULL;" | \
  PGPASSWORD='tu-password' psql -h localhost -U labsis -d toma_turno

echo "✅ Migración de datos completada (opcional)"
```

### Paso 7: Build de Producción

```bash
# Limpiar builds anteriores
rm -rf .next

# Construir para producción
NODE_ENV=production npm run build

# Verificar que el build fue exitoso
# Debe mostrar: "Compiled successfully"

# Verificar tamaño del bundle
du -sh .next

echo "✅ Build de producción completado"
```

### Paso 8: Verificar Variables de Entorno

```bash
# Verificar que .env.production existe
ls -la .env.production

# Verificar contenido (SIN mostrar valores sensibles)
cat .env.production | grep -v "PASSWORD\|SECRET"

# Variables críticas que DEBEN estar:
# - DATABASE_URL
# - PORT=3005 (CRÍTICO)
# - NODE_ENV=production
# - JWT_SECRET
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
```

**Contenido de `.env.production`:**

```bash
DATABASE_URL="postgresql://labsis:TU_PASSWORD@localhost:5432/toma_turno?schema=public"
PORT=3005
NODE_ENV=production
JWT_SECRET=tu-secret-key-super-segura-aqui-2024
NEXTAUTH_URL=http://tomaturno.52.55.189.120.nip.io
NEXTAUTH_SECRET=tu-secret-key-super-segura-aqui-2024
```

### Paso 9: Ejecutar Tests (NUEVO en v2.7.0)

```bash
# Ejecutar suite completa de tests
npm test

# Debe mostrar:
# PASS  __tests__/studiesProcessor.test.js (32 tests)
# PASS  __tests__/labsisTubeMapping.test.js (34 tests)
# Test Suites: 2 passed, 2 total
# Tests:       66 passed, 66 total

# Si los tests fallan, DETENER deployment e investigar

echo "✅ Tests pasados (66/66)"
```

### Paso 10: Iniciar la Aplicación

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Verificar que inició correctamente
pm2 status

# Debe mostrar "online" en status

# Ver logs en tiempo real
pm2 logs toma-turno --lines 50

# Buscar en logs:
# - "Ready on http://0.0.0.0:3005"
# - "Prisma Client initialized"
# - Sin errores críticos

echo "✅ Aplicación iniciada"
```

### Paso 11: Verificación Post-Deployment

```bash
# 1. Verificar que el proceso está corriendo
pm2 status

# 2. Verificar puerto 3005
lsof -i :3005
# Debe mostrar el proceso de Node.js

# 3. Verificar conectividad local
curl http://localhost:3005/api/health
# Debe responder con status 200

# 4. Verificar desde el navegador
# Abrir: http://tomaturno.52.55.189.120.nip.io

# 5. Verificar logs por errores
pm2 logs toma-turno --lines 100 --nostream | grep -i error

# 6. Verificar memoria y CPU
pm2 monit

echo "✅ Verificación post-deployment completada"
```

### Paso 12: Pruebas Funcionales

Realizar las siguientes pruebas manuales:

1. **Login de Usuario**
   - Ir a /login
   - Ingresar credenciales de prueba
   - Verificar que se autentique correctamente

2. **Crear Turno**
   - Ir a /turns/manual
   - Crear un turno de prueba con estudios LABSIS
   - Verificar que se procesen correctamente los tubos
   - Verificar campo `studies_json` en BD

3. **Cola de Turnos**
   - Ir a /turns/queue
   - Verificar que aparezcan turnos
   - Verificar ordenamiento (Special > General, no diferidos primero)

4. **Estadísticas**
   - Ir a /statistics/dashboard
   - Verificar que carguen métricas
   - Probar exportación PDF

5. **Sistema de Cubículos**
   - Ir a /select-cubicle
   - Seleccionar un cubículo
   - Verificar que se marque como ocupado
   - Llamar un paciente desde /turns/attention
   - Finalizar atención

```bash
echo "✅ Pruebas funcionales completadas"
```

### Paso 13: Guardar PM2

```bash
# Guardar configuración de PM2 para auto-start
pm2 save

# Configurar auto-start en boot del sistema (si no está configurado)
pm2 startup

# Seguir las instrucciones que PM2 muestre

echo "✅ PM2 configurado para auto-start"
```

### Paso 14: Monitoreo Post-Deployment

```bash
# Monitorear logs durante 5-10 minutos
pm2 logs toma-turno

# Verificar uso de recursos
pm2 monit

# Verificar que no haya memory leaks
watch -n 5 'pm2 status'

echo "✅ Monitoreo activo"
```

---

## 🔄 Rollback (En caso de problemas)

Si algo sale mal durante el deployment:

```bash
# 1. Detener la aplicación
pm2 stop toma-turno

# 2. Restaurar código anterior
cd /path/to/toma-turno
TIMESTAMP="20251124_143000"  # Ajustar al timestamp de tu backup
tar -xzf ~/backups/toma-turno_code_${TIMESTAMP}.tar.gz

# 3. Restaurar base de datos
PGPASSWORD='tu-password' pg_restore \
  -h localhost \
  -U labsis \
  -d toma_turno \
  -c \
  ~/backups/toma_turno_pre_v2.7.0_${TIMESTAMP}.dump

# 4. Reinstalar dependencias de versión anterior
npm ci --production

# 5. Regenerar Prisma client
npx prisma generate

# 6. Rebuild
NODE_ENV=production npm run build

# 7. Reiniciar aplicación
pm2 restart toma-turno

# 8. Verificar
pm2 logs toma-turno

echo "✅ Rollback completado"
```

---

## 📊 Checklist de Deployment

### Pre-Deployment
- [ ] Backup de base de datos creado
- [ ] Backup de código creado
- [ ] Equipo notificado del deployment
- [ ] Ventana de mantenimiento programada (si aplica)

### Durante Deployment
- [ ] Aplicación detenida
- [ ] Código actualizado a v2.7.0
- [ ] Dependencias instaladas
- [ ] Base de datos migrada
- [ ] Tests ejecutados (66/66 pasando)
- [ ] Build de producción completado
- [ ] Variables de entorno verificadas
- [ ] Aplicación iniciada con PM2
- [ ] Puerto 3005 verificado

### Post-Deployment
- [ ] Aplicación accesible desde URL pública
- [ ] Login funcional
- [ ] Creación de turnos funcional
- [ ] Procesamiento LABSIS funcional
- [ ] Estadísticas cargando correctamente
- [ ] Logs sin errores críticos
- [ ] Uso de recursos normal (CPU/RAM)
- [ ] PM2 guardado y configurado
- [ ] Documentación actualizada
- [ ] Equipo notificado de deployment exitoso

---

## 🆕 Novedades en v2.7.0

### Testing Automatizado
```bash
# Ejecutar antes de cada deployment
npm test                # 66 tests
npm run test:coverage   # Verificar cobertura >= 70%
```

### Nuevos Campos en Base de Datos
- `studies_json`: Estudios en formato estructurado
- `tubesDetails`: Agrupación por tipo de tubo
- `labsisOrderId`: ID de orden LABSIS
- `samplesGenerated`: Muestras con códigos de barras

### Migración Opcional de Datos
```bash
# Solo si quieres convertir datos legacy
node scripts/migrate-studies-to-structured-format.js --execute
```

### Nuevas Dependencias
- Jest 30.2.0 (testing)
- Zod 4.1.12 (validación)
- ts-jest 29.4.5 (TypeScript support)

---

## 🐛 Troubleshooting

### Problema: Aplicación no inicia

```bash
# Verificar logs
pm2 logs toma-turno --err

# Verificar puerto 3005
lsof -i :3005
# Si está ocupado por otro proceso, matar proceso:
kill -9 $(lsof -t -i:3005)

# Reintentar
pm2 restart toma-turno
```

### Problema: Errores de Base de Datos

```bash
# Verificar conexión a PostgreSQL
PGPASSWORD='tu-password' psql -h localhost -U labsis -d toma_turno -c "SELECT 1;"

# Verificar migraciones
npx prisma migrate status

# Si hay migraciones pendientes
npx prisma migrate deploy

# Regenerar cliente Prisma
npx prisma generate
```

### Problema: Tests Fallando

```bash
# Ver detalles de tests fallidos
npm test -- --verbose

# Si es problema de módulos
rm -rf node_modules package-lock.json
npm install
npm test
```

### Problema: Build Falla

```bash
# Limpiar caché de Next.js
rm -rf .next

# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar espacio en disco
df -h

# Verificar memoria
free -h

# Rebuild
NODE_ENV=production npm run build
```

### Problema: Puerto 3005 Ocupado

```bash
# Identificar proceso
lsof -i :3005

# Matar proceso
kill -9 PID

# O matar todos los procesos de Node.js (CUIDADO)
pkill -f node

# Reiniciar aplicación
pm2 restart toma-turno
```

### Problema: Alta Memoria/CPU

```bash
# Verificar uso de recursos
pm2 monit

# Reiniciar aplicación (libera memoria)
pm2 restart toma-turno

# Ver logs de errores
pm2 logs toma-turno --err

# Si persiste, aumentar memoria en ecosystem.config.js
# max_memory_restart: '2G'  # En lugar de 1G
```

---

## 📞 Contacto y Soporte

### En caso de problemas

1. **Durante horario laboral (7:00 AM - 7:00 PM)**
   - Email: saqh5037@gmail.com
   - Teléfono: [Agregar número]

2. **Fuera de horario**
   - Email urgente: saqh5037@gmail.com
   - Logs en: `pm2 logs toma-turno --err`

3. **Recursos**
   - GitHub: https://github.com/saqh5037/TomaTurnoModerno
   - Issues: https://github.com/saqh5037/TomaTurnoModerno/issues
   - Release Notes: https://github.com/saqh5037/TomaTurnoModerno/releases/tag/v2.7.0

---

## 📝 Notas Adicionales

### Horario de Operación
- **Lunes a Viernes:** 7:00 AM - 7:00 PM
- **Sábados, Domingos:** Cerrado
- **Mantenimiento recomendado:** Domingos 12:00 AM - 6:00 AM

### Restart Automático
PM2 está configurado para restart diario a las 3:00 AM:
```javascript
// ecosystem.config.js
cron_restart: '0 3 * * *'
```

### Límites de Recursos
```javascript
// ecosystem.config.js
max_memory_restart: '1G'
max_restarts: 10
```

### Logs
```bash
# Ubicación de logs de PM2
~/.pm2/logs/

# Ver logs
pm2 logs toma-turno

# Logs de errores únicamente
pm2 logs toma-turno --err

# Limpiar logs antiguos
pm2 flush
```

---

## ✅ Deployment Completado

Una vez completados todos los pasos:

1. ✅ Verificar que la aplicación está en estado "online" en PM2
2. ✅ Verificar acceso desde URL pública
3. ✅ Notificar al equipo de deployment exitoso
4. ✅ Actualizar registro de deployments
5. ✅ Monitorear durante las próximas 24 horas

**¡Deployment de v2.7.0 completado exitosamente!** 🎉

---

**Documentación generada el:** 24 de Noviembre de 2025
**Versión de la guía:** 1.0
**Próxima revisión:** Con release v2.8.0
