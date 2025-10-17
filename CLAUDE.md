# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Database Operations
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run database migrations in development
- `npx prisma migrate deploy` - Deploy migrations to production
- `npm run seed` - Populate database with initial data
- `npx prisma studio` - Open Prisma Studio for database management

### Docker Environment
- `docker-compose up -d` - Start all services in background
- `docker-compose down` - Stop all services
- `docker-compose logs -f app` - View application logs

### Testing Sync Operations
- Manual sync testing through dashboard: Settings → Phidias → Sincronización
- Sync logs available in `/logs/` directory

## High-Level Architecture

### Application Structure
This is a **Next.js 15 application** for student disciplinary tracking in educational institutions. The system manages student infractions, automated case generation, and psychological follow-ups with role-based access control.

### Core Domains
1. **Student Management** - Student records, imports, and academic data
2. **Infractions System** - Three-tier disciplinary tracking (Type I/II/III)
3. **Case Management** - Automated case creation and follow-up scheduling
4. **Alert System** - Configurable thresholds and early warning notifications
5. **User Roles & Permissions** - Nine role types with area-specific access
6. **External Integrations** - Phidias sync and Supabase backup

### Database Architecture (PostgreSQL + Prisma)
Key models and relationships:
- **Estudiantes** (Students) - Core student records with school year and grade relations
- **Faltas** (Infractions) - Disciplinary incidents with unique hash IDs and automated case triggers
- **Casos/Seguimientos** (Cases/Follow-ups) - Type II infractions generate cases with 3 mandatory follow-ups
- **Users** - Role-based authentication with area permissions and grade assignments
- **SchoolYear/Trimestre** - Academic period management
- **AlertSettings** - Configurable thresholds per academic section

### Role System
- **ADMIN** - Full system access
- **Coordinators** (4 types) - PRESCHOOL_COORDINATOR, ELEMENTARY_COORDINATOR, MIDDLE_SCHOOL_COORDINATOR, HIGH_SCHOOL_COORDINATOR
- **PSYCHOLOGY** - Access to cases and follow-ups across all sections
- **TEACHER** - Group-specific student management
- **STUDENT/USER** - Limited access roles

### Key Business Logic
- **Automatic Case Generation**: Type II infractions automatically create cases requiring 3 psychological follow-ups
- **Alert Thresholds**: Configurable per section - Type I infractions trigger alerts when thresholds exceeded
- **Academic Filtering**: All data filtered by active school year and academic sections
- **Phidias Integration**: Daily automated sync at 6 AM UTC for student data and infraction updates

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **State Management**: Zustand stores, React Query for server state
- **Authentication**: Custom JWT with role-based middleware
- **External APIs**: Phidias integration, Supabase sync, Google AI SDK

### Critical File Patterns
- `/src/app/api/v1/` - All API endpoints follow RESTful structure
- `/src/components/` - Organized by domain (students, dashboard, auth, etc.)
- `/src/stores/` - Zustand stores for client state
- `/src/types/` - TypeScript definitions aligned with Prisma schema
- `/prisma/schema.prisma` - Single source of truth for database structure

### Security Considerations
- All routes protected by role-based middleware in `/src/middleware.ts`
- Password hashing with bcrypt
- JWT tokens with proper expiration
- Area-based permissions for data access
- SQL injection prevention through Prisma ORM

### Import/Export Features
- CSV import for students and infractions with duplicate detection
- Automated trimester detection based on dates
- Error handling and validation for bulk operations

### Development Notes
- Uses Turbopack for faster development builds
- Docker containerized with PostgreSQL
- Extensive indexing for performance on large datasets
- Automated cron jobs for Phidias synchronization
- Comprehensive logging system in `/logs/` directory