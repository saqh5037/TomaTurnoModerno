# 🤖 CLAUDE.md - Instrucciones Operativas para TomaTurno

**Sistema**: TomaTurno - Gestión de Turnos Médicos
**Entorno**: Producción Activa - Instituto Nacional de Enfermedades Respiratorias
**Stack**: Next.js 15 + PostgreSQL + Prisma + Chakra UI
**Última Actualización**: 20 de Septiembre, 2024

---

## 🎯 REGLAS FUNDAMENTALES DE TRABAJO

### ⚠️ CRÍTICO - ANTES DE CUALQUIER ACCIÓN

1. **🚨 SISTEMA EN PRODUCCIÓN**: Este sistema tiene usuarios activos en el INER
2. **🔒 SEGURIDAD PRIMERO**: Existen vulnerabilidades críticas que requieren atención inmediata
3. **📋 PLANIFICACIÓN OBLIGATORIA**: Toda modificación debe seguir el flujo establecido
4. **📊 TRAZABILIDAD COMPLETA**: Cada cambio debe quedar documentado

---

## 🚀 PROTOCOLO DE INICIO DE SESIÓN

### 1. Lectura Obligatoria de Contexto (ORDEN ESPECÍFICO)

```bash
# PASO 1: Leer arquitectura y estado técnico
📖 LEER: planning.md
- Stack tecnológico actual
- Arquitectura del sistema
- Configuraciones críticas
- Flujos de datos principales

# PASO 2: Verificar tareas y prioridades
📋 LEER: tasks.md
- Estado actual del proyecto
- Tareas críticas pendientes
- Bugs activos que requieren atención
- Progreso de sprints

# PASO 3: Entender objetivos del producto
🎯 LEER: PRD.md
- Requisitos funcionales
- Métricas de éxito
- Roadmap de desarrollo
- Stakeholders y contexto médico
```

### 2. Identificación del Contexto de Trabajo

**Determinar el tipo de sesión**:
- 🚨 **Emergencia/Hotfix**: Vulnerabilidad crítica o bug en producción
- 🔧 **Desarrollo/Feature**: Nueva funcionalidad o mejora planificada
- 🧪 **Testing/QA**: Verificación y testing de cambios
- 📚 **Documentación**: Actualización de docs y procedimientos
- 🔍 **Investigación**: Análisis de problemas o exploración técnica

### 3. Verificación de Estado del Sistema

```bash
# Verificar que el servidor esté funcionando
✅ curl http://localhost:3005/api/health

# Verificar base de datos
✅ npx prisma studio --port 5555

# Verificar logs recientes
✅ tail -n 50 logs/application.log
```

---

## 🔄 PROTOCOLO DURANTE EL DESARROLLO

### 1. Gestión en Tiempo Real de Tareas

```markdown
⚡ ACTUALIZACIÓN INMEDIATA de tasks.md:
- Al iniciar una tarea → Estado: "in_progress"
- Al completar una tarea → Estado: "completed" + timestamp
- Al encontrar un problema → Crear nueva tarea con prioridad
- Al hacer commit → Actualizar progreso correspondiente
```

### 2. Documentación de Decisiones Técnicas

**En planning.md registrar**:
- Cambios en arquitectura o stack
- Nuevas dependencias agregadas
- Modificaciones a esquemas de BD
- Configuraciones críticas actualizadas
- Patrones de código establecidos

### 3. Gestión de Problemas y Deuda Técnica

```markdown
🐛 BUGS ENCONTRADOS:
- Crear tarea inmediata en tasks.md
- Clasificar severidad: CRÍTICO/ALTO/MEDIO/BAJO
- Si es CRÍTICO → Pausar desarrollo actual
- Documentar workaround temporal si existe

💳 DEUDA TÉCNICA:
- Registrar en tasks.md con etiqueta "debt"
- Incluir estimación de esfuerzo
- Priorizar según impacto en producción
```

### 4. Estándares de Código Estrictos

#### TypeScript (Migración Progresiva)
```typescript
// ✅ CORRECTO: Tipos explícitos
interface PatientTurn {
  id: string;
  patientName: string;
  assignedTurn: string;
  status: 'Pending' | 'Called' | 'InProgress' | 'Completed';
}

// ❌ INCORRECTO: Any o tipos implícitos
const processPatient = (data: any) => { /* ... */ }
```

#### React - Componentes Funcionales con Hooks
```jsx
// ✅ CORRECTO: Hooks personalizados para lógica compleja
const usePatientQueue = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  // Lógica reutilizable...
  return { patients, loading, callNextPatient };
};

// ✅ CORRECTO: Componente funcional limpio
const PatientCard = ({ patient, onCall }) => {
  const { isLoading } = usePatientQueue();
  return (
    <Card>
      {/* JSX limpio y legible */}
    </Card>
  );
};
```

#### Prisma - Operaciones de Base de Datos
```javascript
// ✅ CORRECTO: Queries optimizadas con includes específicos
const getPatientWithDetails = async (id) => {
  return prisma.turnRequest.findUnique({
    where: { id },
    include: {
      cubicle: true,
      attendedBy: {
        select: { id: true, name: true }
      }
    }
  });
};

// ❌ INCORRECTO: Query no optimizada
const getAllData = async () => {
  return prisma.turnRequest.findMany(); // Sin filtros ni paginación
};
```

#### Validación con Zod (Implementación Prioritaria)
```javascript
// ✅ CORRECTO: Validación explícita en endpoints críticos
import { z } from 'zod';

const CreateTurnSchema = z.object({
  patientName: z.string().min(2).max(100),
  age: z.number().int().min(0).max(120),
  studies: z.array(z.string()).max(10)
});

export async function POST(request) {
  try {
    const body = await request.json();
    const validData = CreateTurnSchema.parse(body);
    // Procesar datos validados...
  } catch (error) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
}
```

---

## 🧪 PROTOCOLO DE TESTING

### 1. Testing Obligatorio para Funcionalidades Críticas

```javascript
// Áreas que REQUIEREN tests:
- Sistema de autenticación y autorización
- Creación y gestión de turnos
- Cálculos de estadísticas
- Endpoints de API críticos
- Componentes de interface médica
```

### 2. Casos Edge Documentados

```markdown
📝 DOCUMENTAR en tasks.md:
- Comportamiento con BD vacía
- Límites de usuarios concurrentes
- Manejo de sesiones expiradas
- Comportamiento offline/red lenta
- Casos de rollback de transacciones
```

### 3. Cobertura Mínima

- **Nuevos módulos**: >80% cobertura
- **Funcionalidades críticas**: 100% cobertura
- **APIs públicas**: Tests de integración obligatorios

---

## 🚨 MANEJO DE ERRORES Y EMERGENCIAS

### 1. Priorización de Seguridad

```markdown
🔥 ORDEN DE PRIORIDAD:
1. CRÍTICO: Vulnerabilidades de seguridad activas
2. ALTO: Bugs que afectan pacientes en producción
3. MEDIO: Performance que impacta operación médica
4. BAJO: Mejoras de UX y features no críticas
```

### 2. Protocolo de Vulnerabilidades

```bash
# Al detectar vulnerabilidad crítica:
1. 🛑 PARAR todo desarrollo no relacionado
2. 📋 Crear tarea CRÍTICA en tasks.md
3. 🔒 Implementar fix inmediato
4. 🧪 Testing exhaustivo del fix
5. 📤 Deploy urgente siguiendo protocolo
6. 📝 Post-mortem y documentación
```

### 3. Workarounds Temporales

```markdown
⚠️ DOCUMENTAR CLARAMENTE:
- Razón del workaround
- Impacto en funcionalidad
- Fecha límite para fix definitivo
- Pasos para revertir cuando se implemente solución
```

---

## 📤 PROTOCOLO DE FINALIZACIÓN DE SESIÓN

### 1. Actualización Obligatoria de Documentos

```bash
# ANTES DE FINALIZAR:
✅ tasks.md → Progreso actualizado + próximos pasos
✅ planning.md → Cambios técnicos documentados
✅ Commits → Mensajes descriptivos y claros
✅ PRD.md → Métricas actualizadas si aplica
```

### 2. Formato de Commits

```bash
# ESTRUCTURA OBLIGATORIA:
tipo(scope): descripción concisa

🚨 fix(auth): resolve JWT token validation vulnerability
⚡ perf(queue): implement Redis caching for patient list
✨ feat(stats): add real-time dashboard metrics
📚 docs(api): update endpoint documentation
🧪 test(auth): add integration tests for login flow
🔧 chore(deps): update dependencies to patch vulnerabilities
```

### 3. Resumen de Sesión

```markdown
📊 TEMPLATE DE RESUMEN:
## Sesión del [FECHA]

### ✅ Completado:
- [Lista específica de tareas completadas]

### 🔄 En Progreso:
- [Tareas iniciadas pero no terminadas]

### 🚨 Bloqueadores Encontrados:
- [Problemas que impiden progreso]

### 🎯 Próximos Pasos Recomendados:
1. [Tarea prioritaria #1]
2. [Tarea prioritaria #2]
3. [Tarea prioritaria #3]

### ⚠️ Alertas para Próxima Sesión:
- [Problemas críticos a considerar]
```

---

## 🔧 COMANDOS Y CONFIGURACIONES ESENCIALES

### Desarrollo Local
```bash
# Iniciar ambiente completo
npm run dev                    # Servidor en puerto 3000
PORT=3005 npm run dev          # Puerto personalizado
npx prisma studio              # Base de datos GUI

# Base de datos
npx prisma generate            # Regenerar cliente
npx prisma migrate deploy      # Aplicar migraciones
DATABASE_URL="..." npx prisma db seed  # Datos de prueba
```

### Testing y Calidad
```bash
npm run lint                   # ESLint
npm run build                  # Verificar build
npm run test                   # Tests unitarios (cuando estén configurados)
```

### Base de Datos Productiva
```bash
# CUIDADO: Solo usar en emergencias
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public" node scripts/emergency-backup.js
```

---

## 🔐 CONSIDERACIONES DE SEGURIDAD CRÍTICAS

### Variables de Entorno Obligatorias
```bash
# NUNCA HARDCODEAR:
NEXTAUTH_SECRET=               # JWT secret
DATABASE_URL=                  # Connection string
ENCRYPTION_KEY=                # Para datos sensibles
RATE_LIMIT_REDIS_URL=         # Redis para rate limiting
```

### Headers de Seguridad Requeridos
```javascript
// En middleware.js o pages/_app.js
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

### Validación de Inputs
```javascript
// SIEMPRE validar en endpoints críticos:
- Sanitización HTML (XSS prevention)
- Validación de tipos con Zod
- Rate limiting por IP y usuario
- Autenticación en endpoints sensibles
```

---

## 📊 MÉTRICAS A MONITOREAR

### Performance
- Tiempo de respuesta API < 200ms
- Tiempo de carga página < 1s
- Usuarios concurrentes soportados

### Operacionales
- Uptime del sistema > 99.9%
- Errores en logs < 0.1%
- Tiempo promedio de atención médica

### Seguridad
- Intentos de login fallidos
- Requests bloqueados por rate limiting
- Vulnerabilidades detectadas

---

**📋 Este documento es un contrato de trabajo entre desarrolladores y debe seguirse estrictamente para mantener la calidad y seguridad del sistema médico TomaTurno.**

**🏥 Recordatorio: Cada línea de código impacta directamente la atención médica de pacientes reales en el INER.**