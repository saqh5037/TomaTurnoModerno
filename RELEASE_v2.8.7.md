# Release v2.8.7 - Panel de Control Admin Mejorado

**Fecha:** 2026-01-12
**Autor:** Samuel Quiroz

---

## Resumen

Esta versión incluye mejoras significativas al Panel de Control Administrativo, correcciones importantes para rutas públicas y mejoras en la experiencia de usuario.

---

## Nuevas Funcionalidades

### 1. Panel de Control Admin Mejorado (`/admin/control-panel`)

- **Dashboard en tiempo real** con contadores actualizados cada 3 segundos:
  - Turnos en espera
  - Turnos en holding
  - Turnos llamando
  - Turnos en atención
  - Turnos finalizados hoy

- **Panel de flebotomistas activos** con estados:
  - Disponible (gris)
  - Llamando (azul)
  - Atendiendo (verde)
  - Con Holding (naranja)

- **Panel de cubículos** con estados visuales

- **Tabla de turnos** con filtros por:
  - Estado del turno
  - Flebotomista asignado
  - Búsqueda por nombre o número

- **Botón de volver** agregado al header para mejor navegación

### 2. Botón de Cambio de Prioridad Mejorado

- Nuevo icono de **estrella** (FiStar) más intuitivo
- Estrella outline para turnos General
- Estrella sólida para turnos Special
- Color amarillo consistente
- Tooltips dinámicos: "Hacer Prioritario" / "Quitar Prioridad"

### 3. API de Cambio de Prioridad (`/api/admin/change-priority`)

- Nueva API para cambiar prioridad de turnos
- Validación de roles (solo admin/supervisor)
- Registro automático en auditoría
- Soporte para turnos Pending e In Progress

### 4. Tarjeta Panel de Control en Página Principal

- Nueva tarjeta "Panel de Control" visible solo para administradores
- Ubicada después de "Estadísticas"
- Navegación directa a `/admin/control-panel`

---

## Correcciones

### 1. Rutas Públicas Sin Redirección

- **Problema:** `/turns/queue` redirigía al login cuando expiraba la sesión
- **Solución:** Agregado array `PUBLIC_ROUTES` en AuthContext
- **Rutas afectadas:**
  - `/turns/queue`
  - `/turns/queue_video`
  - `/turns/queue-tv`
  - `/announce`
  - `/satisfaction-survey`

### 2. Mejoras en Logout

- Limpieza correcta de sesiones en servidor
- Liberación de holdings al cerrar sesión
- Liberación de cubículos asignados

---

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `contexts/AuthContext.js` | Agregado PUBLIC_ROUTES, protección de rutas públicas |
| `pages/admin/control-panel.js` | Mejoras UI, botón volver, icono estrella |
| `pages/index.js` | Agregada tarjeta Panel de Control |
| `src/app/api/admin/dashboard/route.js` | API dashboard mejorada |
| `src/app/api/admin/turns/route.js` | Filtros y búsqueda mejorados |
| `src/app/api/auth/logout/route.js` | Limpieza de sesiones mejorada |

## Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| `src/app/api/admin/change-priority/route.js` | Nueva API para cambiar prioridad |
| `tests/manual-test-execution.sh` | Script de pruebas automatizadas |
| `tests/TEST_RESULTS_2026-01-12.md` | Resultados de pruebas |

---

## Pruebas Ejecutadas

- 25 pruebas ejecutadas
- 25 pruebas exitosas (100%)
- Verificación de:
  - Acceso a rutas públicas sin auth
  - APIs de admin funcionando
  - Cambio de prioridad con auditoría
  - Consistencia de contadores

---

## Notas de Despliegue

1. No hay cambios en el esquema de base de datos
2. No se requieren migraciones
3. Reiniciar servidor después de desplegar

---

## Compatibilidad

- Node.js 18+
- PostgreSQL 14+
- Next.js 15.0.3
