# 🏗️ PLANNING.md - Arquitectura y Stack Técnico TomaTurno

**Proyecto**: TomaTurno - Sistema de Gestión de Turnos Médicos
**Cliente**: Instituto Nacional de Enfermedades Respiratorias (INER)
**Estado**: Producción Activa
**Última Actualización**: 25 de Septiembre, 2024

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Visión General
TomaTurno utiliza una arquitectura monolítica moderna basada en Next.js con separación clara entre frontend y backend, optimizada para entornos médicos con requisitos de alta disponibilidad y seguridad.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │────│    BACKEND       │────│   DATABASE      │
│   Next.js UI    │    │   API Routes     │    │   PostgreSQL    │
│   React + Chakra│    │   Prisma ORM     │    │   +Indexing     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   INFRAESTRUCTURA │
                    │   PM2 + Nginx    │
                    │   SSL + Security │
                    └──────────────────┘
```

---

## 💻 STACK TECNOLÓGICO ACTUAL

### Frontend Stack
| Tecnología | Versión | Propósito | Estado |
|------------|---------|-----------|---------|
| **Next.js** | 15.0.3 | Framework React con SSR | ✅ Estable |
| **React** | 18.x | Biblioteca UI principal | ✅ Estable |
| **Chakra UI** | 2.x | Sistema de diseño y componentes | ✅ Estable |
| **TailwindCSS** | 3.x | Utilidades CSS | ✅ Estable |
| **Framer Motion** | 10.x | Animaciones y transiciones | ✅ Estable |
| **React Icons** | 4.x | Iconografía (Lucide + Font Awesome) | ✅ Estable |
| **Chart.js** | 3.x | Gráficos de estadísticas | ✅ Estable |
| **Recharts** | 2.x | Componentes de gráficos React | ✅ Estable |
| **jsPDF** | 2.x | Generación de reportes PDF | ✅ Estable |

### Backend Stack
| Tecnología | Versión | Propósito | Estado |
|------------|---------|-----------|---------|
| **Node.js** | 18+ | Runtime JavaScript | ✅ Estable |
| **Next.js API Routes** | 15.0.3 | Endpoints RESTful | ✅ Estable |
| **Prisma ORM** | 5.x | Object-Relational Mapping | ✅ Estable |
| **PostgreSQL** | 14+ | Base de datos principal | ✅ Estable |
| **jsonwebtoken** | 9.x | Autenticación JWT | ⚠️ Vulnerabilidades |
| **bcrypt** | 5.x | Hashing de contraseñas | ✅ Estable |
| **formidable** | 3.x | Manejo de uploads | ✅ Estable |

### Herramientas de Desarrollo
| Herramienta | Versión | Propósito | Estado |
|-------------|---------|-----------|---------|
| **ESLint** | 8.x | Linting de código | ✅ Configurado |
| **Prettier** | 2.x | Formateo de código | 🔄 Por configurar |
| **TypeScript** | 5.x | Type safety | 🔄 Migración parcial |

### Infraestructura y Deploy
| Componente | Tecnología | Estado | Notas |
|------------|------------|---------|-------|
| **Process Manager** | PM2 | ✅ Configurado | Auto-restart, clustering |
| **Reverse Proxy** | Nginx | ✅ Configurado | SSL termination, load balancing |
| **SSL** | Let's Encrypt | ✅ Configurado | Auto-renewal configurado |
| **Monitoring** | Pendiente | 🔄 Por implementar | Winston + health checks |
| **Logging** | Console | ⚠️ Básico | Migrar a Winston estructurado |
| **Cache** | Memoria | ⚠️ Limitado | Migrar a Redis |
| **Backup** | Manual | ⚠️ Crítico | Automatizar backups |

---

## 📁 ESTRUCTURA DE PROYECTO

### Organización de Directorios
```
toma-turno/
├── 📁 pages/                          # Next.js Pages Router
│   ├── 📁 api/                        # API Routes (Backend)
│   │   ├── 📁 auth/                   # Autenticación
│   │   ├── 📁 turns/                  # Gestión de turnos
│   │   ├── 📁 statistics/             # Métricas y reportes
│   │   ├── 📁 queue/                  # Cola de espera
│   │   └── 📁 users/                  # Gestión de usuarios
│   ├── 📁 docs/                       # Documentación interactiva
│   ├── 📁 statistics/                 # Páginas de estadísticas
│   ├── 📁 turns/                      # Páginas de turnos
│   └── 📁 users/                      # Páginas de usuarios
├── 📁 components/                      # Componentes React reutilizables
│   ├── 📁 theme/                      # Temas y estilos globales
│   ├── 📁 docs/                       # Componentes de documentación
│   └── 📁 ui/                         # Componentes base de UI
├── 📁 contexts/                        # React Contexts
│   └── AuthContext.js                 # Estado global de autenticación
├── 📁 lib/                            # Utilidades y configuraciones
│   ├── 📁 docs/                       # Lógica de documentación
│   └── 📁 utils/                      # Funciones auxiliares
├── 📁 prisma/                         # Configuración de base de datos
│   ├── schema.prisma                  # Esquema de BD
│   ├── migrations/                    # Migraciones de BD
│   └── seed.js                        # Datos de prueba
├── 📁 public/                         # Assets estáticos
│   ├── 📁 images/                     # Imágenes y logos
│   └── 📁 icons/                      # Iconos personalizados
├── 📁 scripts/                        # Scripts de mantenimiento
│   ├── create-test-turns.js           # Generación de datos de prueba
│   ├── seedFullYearData.js            # Datos anuales de testing
│   └── testStatistics.js             # Testing de cálculos
├── 📁 styles/                         # Estilos CSS
│   └── globals.css                    # Estilos globales
└── 📁 docs/                           # Documentación del proyecto
    ├── PRD.md                         # Product Requirements
    ├── claude.md                      # Instrucciones para IA
    ├── planning.md                    # Este archivo
    └── tasks.md                       # Tracking de tareas
```

### Patrones de Organización de Código

#### API Routes (`pages/api/`)
```javascript
// Estructura estándar para endpoints
pages/api/
├── endpoint/
│   ├── route.js                 # Operaciones CRUD principales
│   ├── [id]/
│   │   └── route.js            # Operaciones por ID
│   └── bulk/
│       └── route.js            # Operaciones en lote
```

#### Componentes React (`components/`)
```javascript
// Estructura de componentes reutilizables
components/
├── ui/                          # Componentes base (Button, Card, etc.)
├── layout/                      # Layout y navegación
├── features/                    # Componentes específicos por feature
└── theme/                       # Temas y estilos compartidos
```

---

## 🔌 INTEGRACIONES Y SERVICIOS

### Integraciones Actuales
| Servicio | Tipo | Estado | Propósito |
|----------|------|---------|-----------|
| **PostgreSQL** | Base de datos | ✅ Activo | Almacenamiento principal |
| **jsPDF** | Biblioteca | ✅ Activo | Generación de reportes |
| **Chart.js/Recharts** | Biblioteca | ✅ Activo | Visualización de datos |

### Integraciones Planificadas
| Servicio | Tipo | Prioridad | Timeline |
|----------|------|-----------|----------|
| **Redis** | Cache/Sessions | 🔥 ALTA | Q4 2024 |
| **WebSockets** | Real-time | 🔥 ALTA | Q4 2024 |
| **Winston** | Logging | 🔥 ALTA | Q4 2024 |
| **Backup automático** | Infraestructura | 🔥 CRÍTICA | Inmediato |
| **Monitoring APM** | Observabilidad | 🟡 MEDIA | Q1 2025 |
| **CDN** | Performance | 🟡 MEDIA | Q1 2025 |

### Integraciones con Sistemas Hospitalarios (Futuro)
| Sistema | Propósito | Estado | Notas |
|---------|-----------|---------|-------|
| **HIS INER** | Información de pacientes | 🔄 Planificado | Integración via API |
| **Active Directory** | Autenticación SSO | 🔄 Planificado | LDAP/SAML |
| **Sistema de Facturación** | Billing médico | 🔄 Evaluación | Dependiente de HIS |
| **Comunicaciones** | Notificaciones | 🔄 Planificado | SMS/Email gateway |

---

## 🗄️ MODELO DE DATOS Y ESQUEMA

### Esquema Prisma Actual
```prisma
// Modelo de usuarios del sistema
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())

  // Relaciones
  attendedTurns TurnRequest[] @relation("AttendedBy")

  @@map("User")
}

// Tipos de usuario
enum Role {
  ADMIN
  FLEBOTOMISTA
  USER

  @@map("Role")
}

// Solicitudes de turno - Core del sistema
model TurnRequest {
  id           String    @id @default(cuid())
  patientName  String
  age          Int
  gender       String
  contactInfo  String?
  studies      String    // JSON array de estudios
  tubesRequired Int      @default(1)
  observations String?
  clinicalInfo String?

  // Control de flujo
  assignedTurn String    @unique
  status       Status    @default(PENDING)
  isCalled     Boolean   @default(false)
  tipoAtencion String    @default("General") // "General" | "Especial"

  // Timestamps de proceso
  createdAt    DateTime  @default(now())
  calledAt     DateTime?
  startedAt    DateTime?
  finishedAt   DateTime?

  // Relaciones
  attendedBy   User?     @relation("AttendedBy", fields: [attendedById], references: [id])
  attendedById String?
  cubicle      Cubicle?  @relation(fields: [cubicleId], references: [id])
  cubicleId    String?

  // Índices para performance
  @@index([status])
  @@index([isCalled])
  @@index([attendedById])
  @@index([createdAt])
  @@index([assignedTurn])

  @@map("TurnRequest")
}

// Estados del turno
enum Status {
  PENDING    // En cola
  CALLED     // Llamado
  ATTENDING  // En atención
  ATTENDED   // Finalizado
  CANCELLED  // Cancelado

  @@map("Status")
}

// Cubículos de atención
model Cubicle {
  id       String      @id @default(cuid())
  name     String      @unique
  type     CubicleType @default(GENERAL)
  isActive Boolean     @default(true)

  // Relaciones
  turns    TurnRequest[]

  @@map("Cubicle")
}

enum CubicleType {
  GENERAL
  SPECIAL

  @@map("CubicleType")
}

// Encuestas de satisfacción
model SatisfactionSurvey {
  id              String   @id @default(cuid())
  turnId          String   @unique
  rating          Int      // 1-5
  comments        String?
  waitTime        String?
  serviceQuality  String?
  createdAt       DateTime @default(now())

  @@map("SatisfactionSurvey")
}
```

### Relaciones Clave
```mermaid
erDiagram
    User ||--o{ TurnRequest : "atiende"
    Cubicle ||--o{ TurnRequest : "asignado"
    TurnRequest ||--o| SatisfactionSurvey : "evalúa"

    User {
        string id PK
        string username UK
        string name
        Role role
    }

    TurnRequest {
        string id PK
        string patientName
        string assignedTurn UK
        Status status
        string attendedById FK
        string cubicleId FK
    }

    Cubicle {
        string id PK
        string name UK
        CubicleType type
    }
```

### Índices de Performance Críticos
```sql
-- Índices implementados para queries frecuentes
CREATE INDEX idx_turnrequest_status ON "TurnRequest"(status);
CREATE INDEX idx_turnrequest_called ON "TurnRequest"("isCalled");
CREATE INDEX idx_turnrequest_attendedby ON "TurnRequest"("attendedById");
CREATE INDEX idx_turnrequest_created ON "TurnRequest"("createdAt");
CREATE INDEX idx_turnrequest_turn ON "TurnRequest"("assignedTurn");

-- Índices compuestos para queries complejas (por implementar)
CREATE INDEX idx_turnrequest_status_date ON "TurnRequest"(status, "createdAt");
CREATE INDEX idx_turnrequest_attendee_date ON "TurnRequest"("attendedById", "finishedAt");
```

---

## 🚀 FLUJOS CRÍTICOS DEL SISTEMA

### 1. Flujo de Atención de Pacientes
```mermaid
sequenceDiagram
    participant P as Paciente
    participant S as Sistema
    participant F as Flebotomista
    participant DB as Base de Datos

    P->>S: Solicita turno (datos personales)
    S->>DB: Crea TurnRequest (status: PENDING)
    S->>P: Entrega QR con número de turno

    Note over S: Paciente espera en cola

    F->>S: Llama siguiente paciente
    S->>DB: Actualiza status: CALLED, isCalled: true
    S->>P: Notifica llamado (pantalla/audio)

    F->>S: Inicia atención
    S->>DB: Actualiza status: ATTENDING, startedAt

    Note over F: Proceso de toma de muestra

    F->>S: Finaliza atención
    S->>DB: Actualiza status: ATTENDED, finishedAt
    S->>P: Solicita evaluación de satisfacción (opcional)
```

### 2. Flujo de Generación de Estadísticas
```mermaid
flowchart TD
    A[Request Estadísticas] --> B{Tipo de Reporte}

    B -->|Diario| C[Query turnos del día]
    B -->|Mensual| D[Query turnos del mes]
    B -->|Por Flebotomista| E[Query por attendedById]

    C --> F[Calcular métricas]
    D --> F
    E --> F

    F --> G{Formato de salida}
    G -->|JSON| H[Return API response]
    G -->|PDF| I[Generar con jsPDF]
    G -->|Excel| J[Export estructurado]

    I --> K[Descargar archivo]
    J --> K
    H --> L[Mostrar en dashboard]
```

### 3. Flujo de Autenticación y Autorización
```mermaid
flowchart TD
    A[Login Request] --> B[Validar credenciales]
    B --> C{Usuario válido?}

    C -->|No| D[Return 401 Unauthorized]
    C -->|Sí| E[Generar JWT token]

    E --> F[Set token en localStorage]
    F --> G[Redirect según rol]

    G --> H{Verificar permisos}
    H -->|Admin| I[Acceso completo]
    H -->|Flebotomista| J[Acceso a atención]
    H -->|Usuario| K[Solo lectura]

    I --> L[Cargar dashboard correspondiente]
    J --> L
    K --> L
```

---

## 🔐 SEGURIDAD Y CONFIGURACIÓN

### Variables de Entorno Críticas
```bash
# Autenticación
NEXTAUTH_SECRET=                    # JWT signing secret (CRÍTICO)
NEXTAUTH_URL=                       # URL base de la aplicación

# Base de datos
DATABASE_URL=                       # PostgreSQL connection string

# Configuración de aplicación
NODE_ENV=                          # production | development
PORT=                              # Puerto del servidor (default: 3000)

# Seguridad (por implementar)
ENCRYPTION_KEY=                    # Para encriptar datos sensibles
RATE_LIMIT_REDIS_URL=             # Redis para rate limiting
CORS_ORIGINS=                      # Orígenes permitidos para CORS
```

### Headers de Seguridad Implementados
```javascript
// En middleware.js (por implementar completamente)
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

### Configuración de CORS
```javascript
// Configuración actual (básica)
const corsConfig = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tomaturno.iner.gob.mx']
    : ['http://localhost:3000', 'http://localhost:3005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 🔧 CONFIGURACIÓN DE DESARROLLO

### Scripts de Package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "seed": "node prisma/seed.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Configuración de ESLint
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Configuración de Prisma
```javascript
// prisma/schema.prisma - Configuración principal
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Comandos de Desarrollo Frecuentes
```bash
# Desarrollo local completo
npm run dev                                    # Servidor en puerto 3000
PORT=3005 npm run dev                         # Puerto personalizado

# Base de datos
npx prisma generate                           # Regenerar cliente Prisma
npx prisma migrate deploy                     # Aplicar migraciones
npx prisma studio --port 5555                # GUI de base de datos

# Datos de prueba
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public" npx prisma db seed

# Testing y calidad
npm run lint                                  # Linting
npm run build                                 # Build de producción
npm run test                                  # Tests (cuando estén configurados)

# Deployment
./deploy_production.sh                        # Deploy a producción
```

---

## 📊 MÉTRICAS Y MONITOREO

### KPIs Técnicos Actuales
| Métrica | Valor Actual | Objetivo | Herramienta |
|---------|--------------|----------|-------------|
| **Response Time API** | ~800ms | <200ms | Manual |
| **Page Load Time** | ~2s | <1s | DevTools |
| **Uptime** | 98.5% | >99.9% | Manual |
| **Concurrent Users** | ~150 | 500+ | Estimado |
| **Database Queries** | Sin optimizar | <100ms | Prisma logs |

### Logs y Debugging
```javascript
// Estructura actual de logging (básica)
console.log(`[${new Date().toISOString()}] ${level}: ${message}`);

// Migración planificada a Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Health Checks (por implementar)
```javascript
// API endpoint propuesto: /api/health
{
  "status": "healthy",
  "timestamp": "2024-09-20T18:00:00.000Z",
  "version": "2.0.0",
  "uptime": "72h 34m 12s",
  "database": {
    "status": "connected",
    "responseTime": "12ms"
  },
  "memory": {
    "used": "245MB",
    "total": "512MB"
  },
  "activeConnections": 23
}
```

---

## 🚧 PROBLEMAS CONOCIDOS Y LIMITACIONES

### Vulnerabilidades de Seguridad Críticas
1. **JWT Secrets Hardcoded**: NEXTAUTH_SECRET en código fuente
2. **Sin Rate Limiting**: APIs expuestas a ataques de fuerza bruta
3. **Validación Insuficiente**: Inputs no validados con esquemas
4. **Sin Sanitización**: Vulnerabilidad a XSS/injection
5. **Headers de Seguridad Faltantes**: CSP, HSTS incompletos

### Limitaciones de Performance
1. **Sin Cache**: Queries repetidas sin optimización
2. **Polling vs WebSockets**: Actualizaciones no en tiempo real
3. **Queries N+1**: Joins ineficientes en estadísticas
4. **Sin Paginación**: Listas grandes sin límites
5. **Bundle Size**: JavaScript sin optimizar para producción

### Deuda Técnica Acumulada
1. **TypeScript Parcial**: Migración 30% completa
2. **Testing Inexistente**: Cobertura de tests ~15%
3. **Documentación Técnica**: APIs sin documentación formal
4. **Logs Básicos**: Sistema de logging rudimentario
5. **Deployment Manual**: Proceso de deploy sin automatizar

---

## 🗓️ ROADMAP TÉCNICO

### Fase 1: Estabilización (4 semanas)
- ✅ Migrar secrets a variables de entorno
- ✅ Implementar validación con Zod
- ✅ Configurar rate limiting básico
- ✅ Headers de seguridad completos
- ✅ Sistema de logs estructurado

### Fase 2: Performance (6 semanas)
- 🔄 Implementar Redis para cache y sesiones
- 🔄 Migrar a WebSockets para real-time
- 🔄 Optimizar queries con paginación
- 🔄 Configurar CDN para assets
- 🔄 Bundle optimization y code splitting

### Fase 3: Escalabilidad (8 semanas)
- 🔄 Containerización con Docker
- 🔄 Pipeline CI/CD automatizado
- 🔄 Monitoring con APM tool
- 🔄 Backup automático configurado
- 🔄 Load balancing configurado

### Fase 4: Enterprise Ready (4 semanas)
- 🔄 Migración completa a TypeScript
- 🔄 Suite de testing completa (>80% coverage)
- 🔄 Documentación API con OpenAPI
- 🔄 Auditoria de seguridad completa
- 🔄 Plan de disaster recovery

---

## 📅 HISTORIAL DE CAMBIOS TÉCNICOS

### Release v2.5.0-prod250921 (25 Septiembre 2024)
**Tipo**: Hotfix + Mejoras UI
**Impacto**: Medio

#### Cambios Implementados:
- **Fix Modal de Llamado**: Corregido problema donde modal en `/turns/queue` no se cerraba
  - Solución técnica: Habilitada función `updateCallStatus()` línea 252
  - Timeout configurado: 5 segundos después del anuncio

- **Modernización UI**: Migración a tema moderno en `/turns/attention`
  - Componentes migrados de `Box` a `GlassCard`
  - Implementación de glassmorphism effects
  - Gradientes aplicados: `linear(135deg, #667eea 0%, #764ba2 100%)`

- **Optimización de Animaciones**: Eliminación de flickering
  - Animación pulse reducida: scale(1.05) → scale(1.02)
  - Ciclo aumentado: 2s → 3s
  - Eliminadas animaciones conflictivas `fadeInUp`

#### Archivos Modificados:
- `pages/turns/queue.js`
- `pages/turns/attention.js`
- `CLAUDE.md`

#### Estado de Deployment:
- ✅ Commit: 85a77a8
- ✅ Tag: v2.5.0-prod250921
- ✅ Branch: development → main
- ✅ Push a GitHub completado

---

**📋 Documento mantenido por**: Equipo de Desarrollo TomaTurno
**🔄 Frecuencia de actualización**: Semanal durante desarrollo activo
**📅 Próxima revisión**: 27 de Septiembre, 2024