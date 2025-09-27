# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated**: September 27, 2025
**Latest Release**: v2.5.0-prod250925
**Status**: Production Ready - Active deployment at INER Medical Institute

## 🚀 Essential Commands

```bash
# Development
npm run dev                    # Start dev server on port 3000
PORT=3005 npm run dev         # Custom port (production uses 3005)

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

// Key database models
// User: Staff with roles (Admin, Flebotomista)
// TurnRequest: Patient appointments with status tracking
// Cubicle: Physical locations (GENERAL/SPECIAL types, ACTIVE/INACTIVE status)
// Session: JWT session management with expiry tracking
// AuditLog: Complete action tracking for compliance
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
- Rate limiting: 100 req/min per IP in middleware.ts
- Security headers configured in middleware
- Account lockout after 5 failed login attempts (30-minute lock)
- Session timeout after 20 minutes of inactivity
- All user actions logged in AuditLog table
- Cross-tab synchronization via localStorage events
- JWT tokens: 8-hour main token, 30-day refresh token

## 🔑 Critical Workflows & Features

### 1. Appointment (Turn) Creation Flow
```
Client → POST /api/turns → Validate → Create TurnRequest → Generate Turn Number → Return to Queue
```

### 2. Patient Calling System
```
Cubicle User → Call Patient → Update Status → Broadcast via SSE → TV Display Updates
```

### 3. Statistics Generation
Real-time statistics calculated from TurnRequest table with status filtering and date ranges.

### 4. Documentation System
Complete CMS in `/api/docs` with modules, events, bookmarks, and feedback tracking.

### 5. Key Business Features
- **Real-time Queue Management**: Patient turn assignment and tracking
- **Cubicle Management**: Support for GENERAL and SPECIAL cubicle types
- **Performance Analytics**: Daily, monthly, and per-phlebotomist statistics
- **PDF Reports**: Professional reports with INER branding and recommendations
- **Role-Based Access**: Admin and Flebotomista specific workflows

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
PORT                     # Server port (3005 in production)
NEXTAUTH_URL             # Base URL for authentication
```

### PM2 Configuration
The system uses PM2 with automatic restarts and memory limits:
- Daily restart at 3 AM
- 1GB memory limit
- Automatic restart on failure
- Logs available via `pm2 logs toma-turno`

## 📁 Project Structure

```
src/app/api/            # API routes (App Router)
pages/                  # Frontend pages (Pages Router)
components/             # React components
contexts/              # React Context providers
lib/                   # Utilities and helpers
prisma/
  ├── schema.prisma    # Database schema
  └── migrations/      # Database migrations
scripts/               # Utility scripts
tests/                 # Test files (limited coverage)
public/                # Static assets
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
All sensitive operations must create audit log entries:
```javascript
await prisma.auditLog.create({
  data: {
    userId,
    action: 'TURN_CREATED',
    details: JSON.stringify({ turnId, patientName }),
    ipAddress: request.headers.get('x-forwarded-for')
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
- Patient flow and wait times
- Medical staff workflows
- Compliance and audit requirements
- System availability during hospital hours (7 AM - 7 PM)

### Performance Considerations
- Database queries should use proper indexing (already configured)
- Large datasets need pagination (currently missing in some areas)
- Real-time updates via SSE for TV displays
- PDF generation can be resource-intensive for large reports