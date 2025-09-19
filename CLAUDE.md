# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TomaTurno is a modern medical appointment queue management system for hospital laboratories, featuring real-time patient tracking, phlebotomist performance analytics, and professional PDF reporting.

## Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: TailwindCSS + Chakra UI
- **Authentication**: JWT with custom AuthContext
- **PDF Generation**: jsPDF with custom templates
- **Charts**: Chart.js, Recharts

## Essential Commands

### Development
```bash
npm run dev                    # Start development server (default port 3000)
PORT=3005 npm run dev          # Start on custom port
PORT=3006 npm run dev          # Alternative port
```

### Database
```bash
npx prisma generate            # Generate Prisma client
npx prisma migrate deploy      # Apply migrations
npx prisma studio              # Open database GUI
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public" npx prisma db seed
```

### Build & Production
```bash
npm run build                  # Build for production
npm run build:prod             # Build with NODE_ENV=production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run analyze                # Bundle analyzer
```

### Test Data Generation
```bash
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public" node scripts/create-test-turns.js
node scripts/seedFullYearData.js    # Generate full year of test data
node scripts/testStatistics.js      # Test statistics calculations
```

### Deployment
```bash
./deploy_production.sh         # Deploy to production server (192.168.2.190:3000)
```

## Architecture

### Core Modules

1. **Turn Management System** (`pages/turns/`)
   - Queue display with real-time updates
   - Patient calling system
   - Cubicle assignment (general/special)
   - Attention tracking with timestamps

2. **Statistics Module** (`pages/statistics/`)
   - Monthly/daily performance metrics
   - Phlebotomist analytics
   - Average attention time tracking
   - PDF report generation with branding

3. **User Management** (`pages/users/`)
   - Role-based access (Admin, Phlebotomist, User)
   - JWT authentication
   - Protected routes via ProtectedRoute component

### API Structure (`src/app/api/`)

- `/api/turns/` - Turn CRUD operations
- `/api/attention/` - Patient attention workflow
- `/api/statistics/` - Analytics endpoints
- `/api/auth/` - Authentication
- `/api/satisfaction-survey/` - Patient feedback
- `/api/cubicles/` - Cubicle management

### Database Schema (Prisma)

Main models:
- `User` - System users with roles
- `TurnRequest` - Patient queue entries with full lifecycle tracking
- `Cubicle` - Physical attention points (GENERAL/SPECIAL types)
- `SatisfactionSurvey` - Patient feedback collection

Key relationships:
- TurnRequest → User (attendedBy)
- TurnRequest → Cubicle (cubicleId)

Performance indexes on: status, isCalled, attendedBy, dates

### Authentication Flow

1. JWT tokens stored in localStorage
2. AuthContext provides user state globally
3. ProtectedRoute component enforces access control
4. Rate limiting middleware (100 req/min)

## Important Configurations

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT secret
- `NEXTAUTH_URL` - Application URL

### Database Connection
- Local: `postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public`
- Production: Configured via `.env.production`

### Deployment Settings
- Production server: 192.168.2.190
- Production port: 3000
- SSH port: 2278
- Service runs alongside Labsis (port 8080)

## Key Patterns

### State Management
- React Context for authentication
- Local state for UI components
- Real-time polling for queue updates

### API Response Format
```javascript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "message" }
```

### Protected Routes
All admin/management pages require authentication and check user roles via ProtectedRoute wrapper.

### Performance Optimizations
- Database indexes on frequently queried fields
- Rate limiting middleware
- Pagination on large datasets
- Efficient Prisma queries with selective includes

## Testing Approach

Manual testing via:
1. Test data generation scripts
2. API testing scripts in `/scripts`
3. Manual verification through UI

## Security Considerations

- JWT expiration configured
- Password hashing with bcrypt
- Rate limiting on API routes
- Input validation on all endpoints
- Protected routes by role
- Security headers in middleware