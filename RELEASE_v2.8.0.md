# Release v2.8.0 - TomaTurno INER

**Fecha:** 2026-01-09
**Autor:** Samuel Quiroz

---

## Resumen de Cambios

Esta versión incluye la integración de campos de identificación de pacientes desde el HIS (Hospital Information System) y mejoras en el sistema de asignación de turnos (holding).

### Nuevas Funcionalidades

1. **Campos de Identificación HIS**
   - `patientID`: CI/Expediente del paciente enviado por HIS
   - `workOrder`: Número de orden de trabajo (OT) enviado por HIS
   - Estos campos se muestran en las pantallas de cola y atención

2. **Sistema de Holding Mejorado**
   - `holdingBy`: ID del flebotomista que tiene el turno reservado
   - `holdingAt`: Timestamp para control de timeout (5 minutos)
   - Prevención de race conditions en asignación de turnos

---

## Archivos Modificados

### Base de Datos (Prisma Schema)
- `prisma/schema.prisma` - Nuevos campos y relaciones

### APIs Backend
- `src/app/api/turns/create/route.js` - Validación Zod para patientID/workOrder
- `src/app/api/turnos/route.js` - Compatibilidad LABSIS
- `src/app/api/attention/list/route.js` - Incluir campos en respuesta
- `src/app/api/queue/list/route.js` - Incluir campos en respuesta
- `src/app/api/turns/queue/route.js` - Incluir campos en respuesta
- `src/app/api/queue_video/list/route.js` - Incluir campos en respuesta
- `src/app/api/attention/call/route.js` - Mejoras en llamado
- `src/app/api/attention/complete/route.js` - Mejoras en completado

### Nuevas APIs (Holding System)
- `src/app/api/queue/assignHolding/route.js` - Asignar turno en holding
- `src/app/api/queue/releaseHolding/route.js` - Liberar turno en holding
- `src/app/api/queue/skipHolding/route.js` - Saltar turno en holding

### Utilidades
- `lib/holdingUtils.js` - Funciones de gestión de holding

### Frontend (Páginas)
- `pages/turns/attention.js` - Mostrar patientID y workOrder
- `pages/turns/queue.js` - Mostrar workOrder en cola
- `pages/turns/queue-tv.js` - Mostrar workOrder en TV
- `pages/turns/queue_video.js` - Mostrar workOrder en video
- `pages/turns/manual.js` - Campos opcionales en formulario

---

## Instrucciones de Deployment

### Pre-requisitos
- Node.js 18+
- PostgreSQL 14+
- Acceso SSH al servidor de producción

### Paso 1: Backup de Base de Datos

```bash
# En el servidor de producción
pg_dump -h localhost -U labsis -d toma_turno > backup_toma_turno_$(date +%Y%m%d_%H%M%S).sql
```

### Paso 2: Ejecutar Migración SQL

```bash
# Ejecutar el script de migración
psql -h localhost -U labsis -d toma_turno -f prisma/migrations/manual/v2.8.0_add_patient_id_work_order.sql
```

O ejecutar manualmente las siguientes queries:

```sql
-- Agregar columnas si no existen
ALTER TABLE "TurnRequest" ADD COLUMN IF NOT EXISTS "patient_id" TEXT;
ALTER TABLE "TurnRequest" ADD COLUMN IF NOT EXISTS "work_order" TEXT;
ALTER TABLE "TurnRequest" ADD COLUMN IF NOT EXISTS "holdingBy" INTEGER;
ALTER TABLE "TurnRequest" ADD COLUMN IF NOT EXISTS "holdingAt" TIMESTAMP(3);

-- Crear índices
CREATE INDEX IF NOT EXISTS "TurnRequest_holdingBy_idx" ON "TurnRequest"("holdingBy");
CREATE INDEX IF NOT EXISTS "TurnRequest_status_holdingBy_idx" ON "TurnRequest"("status", "holdingBy");

-- Foreign key (opcional pero recomendado)
ALTER TABLE "TurnRequest"
ADD CONSTRAINT "TurnRequest_holdingBy_fkey"
FOREIGN KEY ("holdingBy") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
```

### Paso 3: Pull del Código

```bash
cd /path/to/toma-turno
git fetch origin
git checkout v2.8.0
# O si es rama main:
git pull origin main
```

### Paso 4: Instalar Dependencias y Build

```bash
npm ci
npx prisma generate
npm run build:prod
```

### Paso 5: Reiniciar Servicio

```bash
# Con PM2
pm2 restart toma-turno

# O con systemd
sudo systemctl restart toma-turno
```

### Paso 6: Verificación

```bash
# Verificar que la API responde
curl -s http://localhost:3007/api/health | jq

# Verificar campos nuevos en respuesta
curl -s http://localhost:3007/api/queue/list | jq '.pendingTurns[0] | {patientID, workOrder}'
```

---

## Rollback (En caso de problemas)

### 1. Restaurar código anterior
```bash
git checkout v2.7.1
npm ci
npx prisma generate
npm run build:prod
pm2 restart toma-turno
```

### 2. Revertir migración de BD (si es necesario)
```sql
ALTER TABLE "TurnRequest" DROP CONSTRAINT IF EXISTS "TurnRequest_holdingBy_fkey";
DROP INDEX IF EXISTS "TurnRequest_holdingBy_idx";
DROP INDEX IF EXISTS "TurnRequest_status_holdingBy_idx";
ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "patient_id";
ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "work_order";
ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "holdingBy";
ALTER TABLE "TurnRequest" DROP COLUMN IF EXISTS "holdingAt";
```

### 3. Restaurar backup si es necesario
```bash
psql -h localhost -U labsis -d toma_turno < backup_toma_turno_YYYYMMDD_HHMMSS.sql
```

---

## Notas Importantes

1. **Compatibilidad hacia atrás**: Los campos `patientID` y `workOrder` son opcionales (nullable). Los turnos existentes sin estos datos seguirán funcionando normalmente.

2. **HIS Integration**: El HIS debe enviar los campos en el body de la petición POST a `/api/turnos`:
   ```json
   {
     "patientName": "NOMBRE DEL PACIENTE",
     "patientID": "12345678",
     "workOrder": "OT-2026-001234",
     ...
   }
   ```

3. **Sistema de Holding**: El nuevo sistema de holding reemplaza el sistema de sugerencias (suggestedFor/suggestedAt) que queda marcado como DEPRECATED.

---

## Contacto

- **Desarrollador**: Samuel Quiroz
- **Email**: saqh5037@gmail.com
- **Proyecto**: TomaTurno INER - DT Diagnósticos by Labsis
