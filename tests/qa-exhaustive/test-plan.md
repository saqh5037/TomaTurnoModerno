# 🎯 Plan de Testing Exhaustivo - TomaTurno v2.6.2

## 📋 Objetivo
Realizar pruebas exhaustivas de calidad (QA) del sistema TomaTurno, cubriendo todas las funcionalidades críticas antes del release v2.6.2.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 15.0.3 (Pages Router + App Router)
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Auth**: JWT con cookies httpOnly
- **Tiempo Real**: SSE (Server-Sent Events)

### Módulos Principales
1. **Autenticación** - Login/Logout/Session
2. **Gestión de Turnos** - Crear/Listar/Actualizar
3. **Cola de Atención** - Llamar/Atender/Diferir
4. **Cubículos** - Activar/Desactivar/Ocupar
5. **Estadísticas** - Dashboard/Diarias/Mensuales
6. **Usuarios** - CRUD/Roles/Permisos
7. **Panel de Atención** - Interfaz flebotomista

## 🎯 Estrategia de Testing

### Distribución de Tests
```
        /\
       /E2E\       (30%) - Flujos críticos completos
      /------\
     /API Tests\ (50%) - Todas las rutas API
    /------------\
   /Manual Tests  \ (20%) - UX/UI/Validaciones visuales
  /------------------\
```

### Cobertura Objetivo
- ✅ **API Routes**: 100% de endpoints críticos
- ✅ **Flujos E2E**: 100% de user journeys principales
- ✅ **UTF-8**: Validación completa de caracteres especiales
- ✅ **Error Handling**: Casos de error y validaciones
- ✅ **Performance**: Tiempos de respuesta aceptables

## 📊 Tests a Ejecutar

### 1. Tests de API (Integración)

#### Autenticación
- [x] POST /api/auth/login - Login exitoso
- [x] POST /api/auth/login - Credenciales inválidas
- [x] GET /api/auth/verify - Token válido
- [x] GET /api/auth/verify - Token expirado
- [x] POST /api/auth/refresh - Refresh token
- [x] POST /api/auth/logout - Cerrar sesión

#### Turnos (CRÍTICO - Fix UTF-8)
- [x] POST /api/turns/create - Crear turno normal
- [x] POST /api/turns/create - Crear con caracteres UTF-8 (ñ, ü, á, é, í, ó, ú)
- [x] POST /api/turns/create - Validación Zod (datos inválidos)
- [x] POST /api/turns/create - tubesDetails con catálogo INER
- [x] GET /api/turns/queue - Listar cola
- [x] PUT /api/turns/updateStatus - Cambiar estado
- [x] PUT /api/turns/changePriority - Cambiar prioridad

#### Cubículos
- [x] GET /api/cubicles - Listar todos
- [x] GET /api/cubicles/status - Estado de cubículos
- [x] PUT /api/cubicles/[id] - Actualizar cubículo
- [x] PUT /api/cubicles/[id] - Desactivar (sin turnos)
- [x] PUT /api/cubicles/[id] - Desactivar (con turnos - debe fallar)

#### Cola y Atención
- [x] GET /api/queue/list - Listar cola con sesión
- [x] POST /api/queue/call - Llamar paciente
- [x] POST /api/attention/call - Atender paciente
- [x] POST /api/attention/complete - Completar atención
- [x] POST /api/attention/skip - Saltar paciente
- [x] POST /api/queue/defer - Diferir turno

#### Estadísticas
- [x] GET /api/statistics/dashboard - Dashboard principal
- [x] GET /api/statistics/daily - Estadísticas diarias
- [x] GET /api/statistics/monthly - Estadísticas mensuales
- [x] GET /api/statistics/phlebotomists - Rendimiento flebotomistas
- [x] GET /api/statistics/average-time - Tiempo promedio

#### Usuarios
- [x] GET /api/users - Listar usuarios
- [x] POST /api/users - Crear usuario
- [x] PUT /api/users/[id] - Actualizar usuario
- [x] PUT /api/users/[id]/status - Cambiar estado
- [x] PUT /api/users/[id]/reset-password - Resetear password

#### Health Check
- [x] GET /api/health - Estado del sistema

### 2. Tests E2E (Flujos Completos)

#### Flujo 1: Autenticación Completa
1. Usuario visita /login
2. Ingresa credenciales válidas
3. Es redirigido al dashboard
4. Navega entre páginas (verifica auth persistente)
5. Cierra sesión
6. Es redirigido a /login

#### Flujo 2: Creación de Turno Manual (UTF-8)
1. Usuario autenticado accede a /turns/manual
2. Completa formulario con nombre "María Pérez Núñez" (UTF-8)
3. Agrega observaciones con "ñ, ü, á, é, í, ó, ú"
4. Selecciona estudios y tubos
5. Envía formulario
6. Verifica turno creado exitosamente
7. Verifica datos en la cola

#### Flujo 3: Atención de Paciente Completo
1. Flebotomista hace login
2. Selecciona cubículo
3. Accede a /turns/attention
4. Llama primer paciente de la cola
5. Atiende paciente
6. Marca como completado
7. Verifica que turno cambió a "Attended"

#### Flujo 4: Gestión de Cubículos
1. Admin accede a /cubicles
2. Intenta desactivar cubículo con turnos (debe fallar)
3. Completa todos los turnos del cubículo
4. Desactiva cubículo exitosamente
5. Activa cubículo nuevamente

#### Flujo 5: Visualización de Estadísticas
1. Usuario accede a /statistics/dashboard
2. Verifica métricas principales
3. Navega a estadísticas diarias
4. Filtra por fecha
5. Navega a estadísticas mensuales
6. Verifica gráficos y datos

### 3. Tests Manuales (UX/UI)

#### Responsividad
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

#### Navegación
- [ ] Todas las rutas accesibles desde menú
- [ ] Breadcrumbs funcionando
- [ ] Back button del navegador funciona
- [ ] Redirecciones correctas

#### Validaciones de Formularios
- [ ] Mensajes de error claros
- [ ] Campos requeridos marcados
- [ ] Validación en tiempo real
- [ ] Estados de loading

#### Accesibilidad
- [ ] Alt text en imágenes
- [ ] Labels en inputs
- [ ] Navegación por teclado
- [ ] Contraste de colores

## 🐛 Casos de Error a Validar

### 1. Network Errors
- [ ] API timeout
- [ ] 500 Internal Server Error
- [ ] 404 Not Found
- [ ] Network offline

### 2. Validation Errors
- [ ] Campos vacíos
- [ ] Formato inválido
- [ ] Longitud excedida
- [ ] Tipos incorrectos

### 3. Business Logic Errors
- [ ] Cubículo ocupado
- [ ] Turno ya atendido
- [ ] Usuario sin permisos
- [ ] Sesión expirada

### 4. Database Errors
- [ ] Conexión perdida
- [ ] Constraint violations
- [ ] Transacciones fallidas
- [ ] Datos corruptos

## ⚡ Tests de Performance

### Tiempos de Respuesta Objetivo
- API Health: < 100ms
- API Auth: < 200ms
- API Turnos: < 300ms
- API Estadísticas: < 500ms
- Carga de página: < 1s
- Time to Interactive: < 2s

### Carga Concurrente
- 10 usuarios simultáneos
- 50 requests por segundo
- Sin degradación significativa

## 🔐 Tests de Seguridad

### Authentication
- [x] JWT validation
- [x] Cookie httpOnly
- [x] CSRF protection
- [x] Session timeout

### Authorization
- [x] Role-based access
- [x] Protected routes
- [x] API endpoint permissions
- [x] Data isolation

### Input Validation
- [x] SQL Injection prevention (Prisma)
- [x] XSS prevention
- [x] UTF-8 encoding
- [x] Zod schema validation

## 📝 Reporte de Resultados

### Formato del Reporte
```markdown
# QA Report - TomaTurno v2.6.2

## Executive Summary
- Total Tests: X
- Passed: X (X%)
- Failed: X (X%)
- Skipped: X (X%)

## Test Results by Category
### API Tests
- Passed: X/X
- Failed: X/X
- Details: [link]

### E2E Tests
- Passed: X/X
- Failed: X/X
- Details: [link]

### Manual Tests
- Completed: X/X
- Issues Found: X
- Details: [link]

## Critical Issues
1. [Issue description]
2. [Issue description]

## Performance Metrics
- Avg Response Time: Xms
- P95 Response Time: Xms
- Failed Requests: X%

## Recommendations
1. [Recommendation]
2. [Recommendation]
```

## ✅ Criterios de Aceptación

Para aprobar el release v2.6.2, se debe cumplir:

1. ✅ **API Tests**: 100% de tests críticos pasando
2. ✅ **E2E Tests**: Todos los flujos principales funcionando
3. ✅ **UTF-8 Fix**: Validado con caracteres especiales
4. ✅ **Performance**: Dentro de los umbrales definidos
5. ✅ **Security**: Sin vulnerabilidades críticas
6. ✅ **Build**: Compilación exitosa sin errores
7. ✅ **Regression**: Sin bugs introducidos

## 🚀 Ejecución del Plan

### Fase 1: Setup (15 min)
- Instalar dependencias de testing
- Configurar Playwright
- Crear estructura de tests
- Preparar datos de prueba

### Fase 2: API Tests (30 min)
- Ejecutar suite de API tests
- Validar respuestas
- Verificar errores manejados
- Documentar resultados

### Fase 3: E2E Tests (45 min)
- Ejecutar flujos críticos
- Capturar screenshots
- Verificar estados finales
- Documentar issues

### Fase 4: Manual Tests (30 min)
- Validaciones visuales
- Tests de responsividad
- UX/UI checks
- Documentar observaciones

### Fase 5: Reporte Final (15 min)
- Compilar resultados
- Generar gráficos
- Crear reporte ejecutivo
- Preparar recomendaciones

**Total estimado: 2.5 horas**

---

**Creado**: 2025-10-21
**Versión del Sistema**: 2.6.2
**QA Engineer**: Claude (AI)
**Estado**: ✅ Listo para ejecutar
