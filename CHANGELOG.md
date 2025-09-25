# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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