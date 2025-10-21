# Historial de Versiones - Sistema Toma de Turnos INER

## v2.6.1 - 2025-10-07 ✅ CURRENT

### 🎨 Rediseño del Panel de Atención
- Número de turno reubicado a esquina superior izquierda
- Badge "EN ATENCIÓN EN [N]" centrado en parte superior
- Nombre del paciente con mayor prominencia
- Botones rediseñados: "Regresar a Cola" (cyan #2ccbd2), "Cambiar a Especial" (morado #b45ad9)

### ✅ Permisos Mejorados
- Botón "Toma Finalizada" disponible para todos los roles
- Mayor autonomía para flebotomistas

### 🔐 Sistema de Ocupación de Cubículos
- Tracking en tiempo real de cubículos ocupados
- Auto-actualización cada 5 segundos
- Validación de disponibilidad (frontend + backend)
- Indicadores visuales de ocupación
- Prevención de conflictos de doble asignación

**Estado**: Production Ready ✅  
**Commit**: 085ee87  
**Tag**: v2.6.1  
**Archivos modificados**: 5 (+1,178 / -120 líneas)

---

## v2.6.0 - 2025-09-27

### ✨ Sistema de Estado de Usuarios
- Nuevo campo `status` con enum UserStatus (ACTIVE/INACTIVE/BLOCKED)
- Eliminación lógica de usuarios con estado BLOCKED
- UI mejorada con diferenciación clara entre estados
- Opción de restauración para usuarios bloqueados

### 🐛 Correcciones
- Gestión mejorada de usuarios eliminados
- Sincronización de campos `isActive` y `status`
- Filtros de estado optimizados

**Commit**: 8c9746b  
**Tag**: v2.6.0

---

## v2.5.0 - 2025-09-25

### ✨ Sistema de Gestión de Cubículos
- Estados ACTIVO/INACTIVO para cubículos
- Badges visuales distintivos (verde/rojo)
- Filtrado automático en panel de atención
- Validación de integridad referencial
- Ordenamiento inteligente (activos primero)

### 🔒 Mejoras de Seguridad
- Bloqueo de cuenta tras 5 intentos fallidos
- Timeout de sesión a 20 minutos
- Headers de seguridad mejorados
- Rate limiting optimizado

**Tag**: v2.5.0

---

## v2.4.0 - 2025-09-20

### ✨ Sistema de Turnos Diferidos
- Funcionalidad de "Regresar a Cola"
- Priorización automática de turnos diferidos
- Indicadores visuales para turnos regresados
- Contador de llamadas realizadas

### 🎯 Mejoras de UX
- Panel de atención completamente rediseñado
- Sistema de sugerencias inteligentes
- Orden dinámico de flebotomistas

---

## Versiones Anteriores

### v2.3.0 - Sistema de Cubículos Especiales
### v2.2.0 - Estadísticas y Reportes
### v2.1.0 - Sistema de Autenticación JWT
### v2.0.0 - Migración a Next.js 15
### v1.x.x - Sistema Legacy (PHP/MySQL)

---

## Estadísticas Generales

### Releases Totales
- **Major**: 2 (v1.x → v2.x)
- **Minor**: 6 (v2.0 → v2.6)
- **Patch**: 1 (v2.6.1)

### Líneas de Código (aproximado)
- **Frontend**: ~15,000 líneas
- **Backend**: ~8,000 líneas
- **Total**: ~23,000 líneas

### Tecnologías
- Next.js 15.0.3
- React 18.3.1
- Prisma 6.11.1
- PostgreSQL 14+
- Chakra UI 2.10.9

---

*Última actualización: 2025-10-07*  
*Versión actual: v2.6.1*
