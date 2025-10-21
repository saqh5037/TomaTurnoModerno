# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated**: October 16, 2025
**Latest Release**: v2.6.1
**Status**: Production Ready - Active deployment at INER Medical Institute

## 🚀 Essential Commands

```bash
# Development
PORT=3005 npm run dev         # Start dev server on port 3005 (REQUIRED - mapped port for external access)
npm run dev                   # Start dev server on port 3000 (default, but use 3005 for this project)

# Database
npx prisma generate           # Regenerate Prisma client after schema changes
npx prisma migrate dev        # Create and apply migrations (development)
npx prisma migrate deploy     # Apply migrations (production)
npx prisma studio --port 5555 # Open Prisma Studio GUI
npx prisma db seed           # Seed database with test data

# Build & Production
npm run build:prod           # Production build with NODE_ENV=production
npm run start:prod           # Start production server
pm2 start ecosystem.config.js # Start with PM2 process manager
pm2 logs toma-turno          # View PM2 logs
pm2 monit                    # Real-time PM2 monitoring

# Quality & Testing
npm run lint                 # Run ESLint
npm test                     # Run tests (limited coverage)

# Data Generation Scripts
node scripts/seedFullYearData.js    # Generate realistic full year test data
node scripts/testStatistics.js       # Test statistics calculations
node scripts/seedDocumentationData.js # Seed documentation system data
```

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.0.3 with React 18.3.1
- **Database**: PostgreSQL 14+ with Prisma ORM 6.11.1
- **Styling**: Chakra UI 2.10.9 + Tailwind CSS 3.4.17 (hybrid approach)
- **Charts**: Chart.js and Recharts for visualizations
- **PDF Generation**: jsPDF with custom INER branding
- **Process Manager**: PM2 for production deployment

### Hybrid Next.js Architecture
- **App Router** (`src/app/api/`): All API endpoints using Next.js 15 App Router
- **Pages Router** (`pages/`): Frontend pages (legacy pattern, still in use)
- **Mixed Patterns**: Gradual migration from Pages to App Router in progress

### Key API Patterns

#### App Router API Structure
```javascript
// src/app/api/[endpoint]/route.js pattern
export async function GET(request) {
  // Headers are accessed differently in App Router
  const authHeader = request.headers.get('authorization');
  // Use Response.json() for responses
  return Response.json({ data }, { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  // Process and return
}
```

#### Authentication Flow
- JWT tokens stored in localStorage (client) with 8-hour expiry
- Refresh tokens with 30-day expiry
- Custom AuthContext manages state across the app
- Token verification on every API request via middleware

#### Database Operations with Prisma
```javascript
// Always use transactions for multi-table operations
const result = await prisma.$transaction(async (tx) => {
  const turn = await tx.turnRequest.create({ data });
  await tx.auditLog.create({ /* audit entry */ });
  return turn;
});

// Include relations selectively for performance
const turn = await prisma.turnRequest.findUnique({
  where: { id },
  include: {
    cubicle: true,
    attendedBy: { select: { id: true, name: true } }
  }
});

// Key database models and enums
// User: Staff with roles (Admin, Flebotomista, Supervisor), UserStatus enum (ACTIVE, INACTIVE, BLOCKED)
// TurnRequest: Patient appointments with status tracking, timestamps (createdAt, attendedAt, calledAt, finishedAt),
//              tipoAtencion (General/Special), isDeferred flag for queue management
// Cubicle: Physical locations with CubicleType enum (GENERAL, SPECIAL) and ACTIVE/INACTIVE status
// Session: JWT session management with expiry tracking and refresh tokens
// AuditLog: Complete action tracking for compliance with oldValue/newValue JSON fields
// SatisfactionSurvey: Patient feedback with rating and comment
```

### Frontend Architecture

#### Component Organization
- `/components`: Shared React components using Chakra UI
- `/contexts`: React Context providers (AuthContext is primary)
- `/lib`: Utilities and helper functions
- State Management: AuthContext + Zustand + React Query

#### Chakra UI + Tailwind Hybrid
```jsx
// Chakra UI for component structure
<Box bg="white" p={4} borderRadius="md">
  {/* Tailwind for utility styling */}
  <div className="flex justify-between items-center">
    <Text>Content</Text>
  </div>
</Box>
```

### Security Considerations
- Rate limiting: 100 req/min per IP in middleware.ts (applies to all /api/* routes)
- Security headers configured in middleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy)
- Account lockout after 5 failed login attempts (30-minute lock via User.lockedUntil field)
- Session timeout after 20 minutes of inactivity (tracked via Session.lastActivity)
- User status system: ACTIVE (can login), INACTIVE (soft disabled), BLOCKED (hard disabled)
- All user actions logged in AuditLog table with oldValue/newValue JSON tracking
- Cross-tab synchronization via localStorage events
- JWT tokens: 8-hour main token, 30-day refresh token stored in Session table

## 🔑 Critical Workflows & Features

### 1. Appointment (Turn) Creation Flow
```
Client → POST /api/turns → Validate → Create TurnRequest → Generate Turn Number → Return to Queue
```

### 2. Patient Calling System
```
Cubicle User → Call Patient → Update Status → Broadcast via SSE → TV Display Updates
```

### 2.1. Patient Queue Sorting Algorithm (v2.6.1)
Critical sorting hierarchy for displaying patients in the correct order:
```javascript
// Priority Order (highest to lowest):
1. tipoAtencion === 'Special' AND isDeferred === false  // Special patients, not deferred
2. tipoAtencion === 'Special' AND isDeferred === true   // Special patients who were deferred
3. tipoAtencion === 'General' AND isDeferred === false  // General patients, not deferred
4. tipoAtencion === 'General' AND isDeferred === true   // General patients who were deferred
// Within each group, sort by assignedTurn ascending

// Prisma query pattern:
orderBy: [
  { tipoAtencion: 'desc' },    // Special (desc) comes before General
  { isDeferred: 'asc' },        // false (asc) comes before true
  { assignedTurn: 'asc' }       // Lower turn numbers first
]
```
This ensures special patients always have priority, but deferred patients go to the end of their respective groups.

### 3. Statistics Generation
Real-time statistics calculated from TurnRequest table with status filtering and date ranges. Key APIs:
- `/api/statistics/daily` - Daily patient counts with date range filtering
- `/api/statistics/monthly` - Monthly aggregated statistics by year
- `/api/statistics/phlebotomists` - Per-phlebotomist performance metrics
- `/api/statistics/average-time` - Average attention time calculations
- `/api/statistics/dashboard` - Overview metrics for admin dashboard

### 4. Documentation System
Complete CMS in `/api/docs` with modules, events, bookmarks, and feedback tracking.

### 5. Key Business Features
- **Real-time Queue Management**: Patient turn assignment and tracking with deferred patient support
- **Cubicle Management**: Support for GENERAL and SPECIAL cubicle types with occupancy tracking (v2.6.1)
- **Performance Analytics**: Daily, monthly, and per-phlebotomist statistics
- **PDF Reports**: Professional reports with INER branding and recommendations
- **Role-Based Access**: Admin and Flebotomista specific workflows
- **Priority Management**: Supervisors can change patient priority between General/Special (v2.6.1)
- **Deferred Patients**: Smart sorting algorithm that maintains priority hierarchy (v2.6.1)

## ⚠️ Production Considerations

### Active Production System
- **Environment**: Instituto Nacional de Enfermedades Respiratorias (INER)
- **Users**: Medical staff actively using the system
- **Database**: PostgreSQL with production data
- **Critical Hours**: 7:00 AM - 7:00 PM (hospital operation hours)

### Before Making Changes
1. Check active sessions: `SELECT COUNT(*) FROM "Session" WHERE expires > NOW()`
2. Verify no active appointments: Check TurnRequest status
3. Test migrations on development database first
4. Backup production database before schema changes

### Environment Variables
```bash
DATABASE_URL              # PostgreSQL connection string
NEXTAUTH_SECRET          # JWT signing secret (critical)
NODE_ENV                 # production/development
PORT                     # Server port (ALWAYS use 3005 for development and production)
NEXTAUTH_URL             # Base URL for authentication
```

### Port Configuration
**IMPORTANT**: This project MUST run on port 3005 for both development and production:
- Port 3005 is mapped for external access in the deployment configuration
- Always use `PORT=3005 npm run dev` when starting the development server
- Production PM2 configuration already uses port 3005 (see ecosystem.config.js)
- All URLs and documentation reference port 3005

### PM2 Configuration
The system uses PM2 with automatic restarts and memory limits:
- Daily restart at 3 AM
- 1GB memory limit
- Automatic restart on failure
- Logs available via `pm2 logs toma-turno`

## 📁 Project Structure

```
src/app/api/            # API routes (App Router) - all backend logic
  ├── attention/        # Patient attention flow APIs
  ├── auth/            # Authentication (login, refresh, verify)
  ├── cubicles/        # Cubicle management
  ├── docs/            # Documentation system
  ├── profile/         # User profile management
  ├── queue/           # Queue management (call, list, update, defer, assignSuggestions, phlebotomists-order)
  ├── statistics/      # Statistics and analytics
  ├── turns/           # Turn creation, management, and priority changes
  └── users/           # User CRUD and status management
pages/                  # Frontend pages (Pages Router)
  ├── api/            # Legacy API routes (being migrated)
  ├── cubicles/       # Cubicle management UI
  ├── docs/           # Documentation system UI
  ├── statistics/     # Statistics dashboards
  ├── turns/          # Turn management UI
  └── users/          # User management UI
components/             # React components (Chakra UI + Tailwind)
contexts/              # React Context providers (AuthContext is primary)
lib/                   # Utilities, helpers, and prisma client
prisma/
  ├── schema.prisma    # Database schema (User, TurnRequest, Cubicle, Session, AuditLog, SatisfactionSurvey)
  └── migrations/      # Database migrations
scripts/               # Utility scripts (seedFullYearData.js, testStatistics.js, seedDocumentationData.js)
tests/                 # Test files (limited coverage)
public/                # Static assets
ecosystem.config.js    # PM2 configuration (fork mode, 1GB limit, 3AM restart)
middleware.ts          # Rate limiting and security headers
```

## 🔧 Development Patterns

### API Response Pattern
All API responses follow this consistent structure:
```javascript
// Success response
Response.json({ success: true, data: result })

// Error response
Response.json({ success: false, error: errorMessage }, { status: errorCode })
```

### TypeScript Migration
- Gradual migration in progress
- New files should use TypeScript
- Use `.ts`/`.tsx` extensions for new components

### Error Handling Pattern
```javascript
try {
  // Operation
  return Response.json({ success: true, data });
} catch (error) {
  console.error('Operation failed:', error);
  return Response.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```

### Audit Logging
All sensitive operations must create audit log entries with oldValue/newValue tracking:
```javascript
await prisma.auditLog.create({
  data: {
    userId,
    action: 'USER_STATUS_CHANGED', // Action types: USER_CREATED, USER_UPDATED, USER_STATUS_CHANGED, TURN_CREATED, etc.
    entity: 'User',               // Entity type being modified
    entityId: targetUserId,        // ID of the entity
    oldValue: { status: 'ACTIVE' }, // Previous state (JSON)
    newValue: { status: 'BLOCKED' }, // New state (JSON)
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  }
});
```

## 🚨 Known Issues & Technical Debt

1. **Security**: Input validation needs Zod implementation across all endpoints
2. **Testing**: Coverage below 20% - critical paths need tests
3. **TypeScript**: Incomplete migration causing type safety issues
4. **Performance**: Missing pagination on large data queries
5. **Documentation**: API documentation needs OpenAPI/Swagger setup

## 🔄 Common Development Tasks

### Adding a New API Endpoint
1. Create route in `src/app/api/[resource]/route.js`
2. Implement HTTP methods (GET, POST, PUT, DELETE)
3. Add authentication check if needed
4. Include audit logging for sensitive operations
5. Test with Postman/curl

### Modifying Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_change`
3. Run `npx prisma generate`
4. Update related API endpoints
5. Test thoroughly before production migration

### Debugging Production Issues
1. Check logs: `tail -n 100 logs/application.log`
2. Verify database: `npx prisma studio --port 5555`
3. Check active sessions and system status
4. Review recent AuditLog entries for anomalies

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/functional/turns.test.js

# Generate test data for manual testing
node scripts/seedFullYearData.js
```

## 📌 Important Notes

### Medical Context
This is a **medical appointment system** actively used at INER (Instituto Nacional de Enfermedades Respiratorias). Changes should consider:
- Patient flow and wait times (tracked via TurnRequest timestamps: createdAt → calledAt → attendedAt → finishedAt)
- Medical staff workflows (Flebotomista role for phlebotomists, Admin role for management)
- Compliance and audit requirements (all actions logged in AuditLog with oldValue/newValue)
- System availability during hospital hours (7 AM - 7 PM, daily restart at 3 AM via PM2 cron)
- User status management: ACTIVE users can work normally, INACTIVE users are soft-disabled, BLOCKED users are hard-disabled

### Performance Considerations
- Database queries should use proper indexing (already configured)
- Large datasets need pagination (currently missing in some areas)
- Real-time updates via SSE for TV displays
- PDF generation can be resource-intensive for large reports