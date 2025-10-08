# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.1] - 2025-10-07

### 🎨 Agregado
- **Rediseño del Panel de Atención**: Nueva distribución visual más clara y profesional
  - Número de turno reubicado en esquina superior izquierda con tamaño reducido
  - Badge "EN ATENCIÓN EN [N]" centrado en la parte superior
  - Nombre del paciente con mayor prominencia (fuente aumentada)
  - Botones rediseñados con nuevos colores corporativos

### ✅ Mejorado
- **Permisos de Finalización de Toma**: Botón "Toma Finalizada" ahora disponible para todos los roles
  - Permite a Flebotomistas finalizar tomas sin requerir Supervisor
  - Mayor autonomía operacional para el personal médico
  - Reducción de tiempos de espera en el flujo de trabajo

### 🔐 Agregado
- **Sistema de Ocupación de Cubículos**: Prevención de conflictos de asignación
  - Tracking en tiempo real de cubículos ocupados
  - Validación de disponibilidad al seleccionar cubículo
  - Auto-actualización cada 5 segundos del estado
  - Indicadores visuales de ocupación (rojo, itálico)
  - Muestra nombre del usuario ocupante
  - Nueva API `/api/session/update-cubicle` para sincronización
  - Campo `selectedCubicleId` en modelo Session

### 🎨 Mejorado
- **Diseño de Botones en Panel de Atención**:
  - Botón "Regresar a Cola": Cambio de rojo a azul cyan (#2ccbd2), ancho optimizado 280-320px
  - Botón "Cambiar a Especial": Cambio de naranja a morado (#b45ad9), ancho optimizado 280-320px
  - Mejora en la jerarquía visual y consistencia del diseño

### 🐛 Corregido
- **Campo `isActive` en API de cubículos**: Ahora incluido en respuesta de `/api/cubicles/status`
- **Type coercion en selección de cubículos**: Conversión correcta de string a number
- **Cliente Prisma regenerado**: Sincronización con campo `selectedCubicleId` agregado al schema
- **Lógica de sesión más reciente**: Solo considera última sesión activa por usuario para ocupación

### 📝 Archivos Modificados
- `/pages/turns/attention.js` - Rediseño visual y permisos
- `/pages/select-cubicle.js` - Sistema de ocupación y validación
- `/src/app/api/cubicles/status/route.js` - Lógica de tracking
- `/src/app/api/session/update-cubicle/route.js` - Endpoint de actualización (previamente creado)
- `/prisma/schema.prisma` - Campo `selectedCubicleId` (previamente agregado)

### 🎯 Impacto
- **Mejora de UX**: Panel más claro y ordenado visualmente
- **Prevención de conflictos**: Evita que múltiples usuarios seleccionen el mismo cubículo
- **Mayor eficiencia**: Flebotomistas con autonomía completa para finalizar tomas
- **Retrocompatibilidad**: Sin breaking changes, actualización transparente

---

## [2.6.0] - 2025-09-27

### ✨ Agregado
- **Sistema de Estado de Usuarios (ACTIVE/INACTIVE/BLOCKED)**: Nueva gestión de eliminación lógica de usuarios
  - Nuevo campo `status` en modelo User con enum UserStatus
  - Estados diferenciados: ACTIVE (activo), INACTIVE (desactivado temporalmente), BLOCKED (eliminado/bloqueado)
  - Filtro para mostrar/ocultar usuarios bloqueados en listado
  - Switch configurable en UI para incluir usuarios eliminados
  - Opción de restauración para usuarios bloqueados

### 🐛 Corregido
- **Gestión de usuarios eliminados**: Los usuarios eliminados ahora se marcan como BLOQUEADOS en lugar de solo desactivarse
- **Filtros de estado**: Actualización de filtros para diferenciar entre usuarios inactivos y bloqueados
- **Sincronización de estados**: El campo `isActive` ahora se sincroniza correctamente con el campo `status`

### 🔧 Mejorado
- **UI de Gestión de Usuarios**:
  - Diferenciación clara entre desactivar (temporal) y eliminar (permanente)
  - Nuevo badge de estado que muestra BLOCKED para usuarios eliminados
  - Estadística adicional mostrando cantidad de usuarios bloqueados
  - Modal de confirmación actualizado con explicación clara de las acciones
  - Botón de restauración para usuarios bloqueados en menú de acciones
- **API de usuarios**:
  - Endpoint GET ahora soporta parámetro `includeBlocked` para filtrado
  - Endpoint DELETE actualizado para marcar usuarios como BLOCKED
  - Endpoint de status actualizado para sincronizar campo status con isActive
- **Base de datos**:
  - Migración aplicada para agregar campo status con valores por defecto
  - Índice agregado para optimizar consultas por status

### 📚 Documentación
- Actualizado CLAUDE.md con nuevos comandos y patrones de desarrollo
- Documentación mejorada sobre el sistema de gestión de usuarios
- Agregadas notas sobre diferencias entre desactivación y eliminación

## [2.5.0] - 2025-09-25

### ✨ Agregado
- **Sistema de Gestión de Cubículos ACTIVO/INACTIVO**: Implementación completa del sistema de estados para cubículos
  - Estados visuales con badges distintivos (verde/rojo)
  - Filtrado automático en panel de atención
  - Validación de integridad referencial
  - Ordenamiento inteligente (activos primero)

- **Dashboard de Estadísticas con Datos Reales**: Nuevo endpoint comprehensivo `/api/statistics/dashboard`
  - Total de pacientes del mes
  - Pacientes atendidos hoy
  - Tiempo promedio de atención
  - Eficiencia operacional
  - Tendencias comparativas

### 🐛 Corregido
- **Validación Botón "Paciente Atendido"**: Ahora valida que haya un paciente seleccionado antes de procesar
- **Endpoints de Estadísticas**: Corregido status de "Completed" a "Attended" en todos los endpoints
  - `/api/statistics/daily/route.js`
  - `/api/statistics/monthly/route.js`
  - `/api/statistics/phlebotomists/route.js`
  - `/api/statistics/average-time/route.js`
- **Uso de fechas finishedAt**: Cambio de `createdAt` a `finishedAt` para métricas temporales precisas
- **Dashboard mostrando ceros**: Reemplazado datos simulados con llamadas reales a API

### 🔧 Mejorado
- **Optimización de Queries**: Implementación de `Promise.all()` para consultas paralelas (~40% más rápido)
- **Sistema de Locks**: Prevención de clicks duplicados en acciones críticas
- **Animaciones**: Transiciones suaves en ocultamiento de elementos
- **PM2 Configuration**: Actualizada para producción con restart automático diario

### 📚 Documentación
- Creada guía completa de deployment (`DEPLOYMENT_GUIDE_v2.5.0.md`)
- Generadas notas de release detalladas (`RELEASE_NOTES_v2.5.0.md`)
- Actualizado README con información de versión actual
- Actualizada configuración PM2 para producción

## [2.4.0] - 2025-09-21

### ✨ Agregado
- Sistema completo de documentación interna
- API de gestión de módulos y eventos
- Sistema de bookmarks y feedback
- Integración con el sistema principal

### 🐛 Corregido
- Problemas de autenticación en algunas rutas
- Errores de validación en formularios

### 🔧 Mejorado
- Performance en consultas de base de datos
- Manejo de errores más robusto
- Interfaz de usuario más responsiva

## [2.3.0] - 2025-09-19

### ✨ Agregado
- Módulo de estadísticas avanzadas
- Reportes PDF profesionales
- Análisis de tendencias estacionales
- Métricas de performance por flebotomista

### 🔧 Mejorado
- Optimización de consultas SQL
- Reducción del tamaño del bundle
- Mejoras en la accesibilidad

## [2.2.0] - 2025-09-14

### ✨ Agregado
- Sistema de notificaciones en tiempo real
- Panel de control administrativo
- Exportación de datos a Excel
- Modo oscuro

### 🐛 Corregido
- Problemas con zona horaria en estadísticas
- Errores de concurrencia en asignación de turnos

## [2.1.0] - 2025-09-10

### ✨ Agregado
- Gestión de roles y permisos
- Auditoría de acciones de usuario
- Sistema de respaldo automático

### 🔧 Mejorado
- Seguridad con rate limiting
- Validación de entrada con Zod
- Logs estructurados

## [2.0.0] - 2025-09-05

### 💥 Breaking Changes
- Migración a Next.js 15.0.3
- Cambio de Pages Router a App Router híbrido
- Nueva estructura de API

### ✨ Agregado
- App Router para nuevas APIs
- Autenticación con NextAuth
- Integración con Chakra UI

## [1.5.0] - 2025-08-30

### ✨ Agregado
- Sistema de turnos prioritarios
- Gestión de cubículos especiales
- Historial de atenciones

### 🐛 Corregido
- Problemas de sincronización entre cubículos
- Errores en cálculo de tiempos de espera

## [1.0.0] - 2025-08-14

### ✨ Lanzamiento Inicial
- Sistema básico de gestión de turnos
- Interfaz de usuario con TailwindCSS
- Autenticación básica
- Base de datos PostgreSQL con Prisma
- Asignación automática de turnos
- Panel de llamado de pacientes

---

## Tipos de Cambios

- `✨ Agregado` para nuevas funcionalidades
- `🔧 Mejorado` para cambios en funcionalidades existentes
- `🐛 Corregido` para corrección de errores
- `💥 Breaking Changes` para cambios incompatibles con versiones anteriores
- `🗑️ Deprecado` para funcionalidades que serán eliminadas
- `🔐 Seguridad` para vulnerabilidades corregidas
- `📚 Documentación` para cambios en documentación