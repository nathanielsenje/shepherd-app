# Church Integration Management System (Shepherd)

A secure, privacy-first backend API for church administrative staff to manage member lifecycles, track engagement, coordinate ministry involvement, and maintain family relationships.

## 🚀 Quick Start

```bash
# 1. Start services
npm run docker:up

# 2. Run migrations (one-time setup)
npm run prisma:generate
npm run prisma:migrate

# 3. Seed sample data
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shepherd_db" npm run prisma:seed

# 4. Start the app
npm run start:dev
```

**URLs:**
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs
- Supabase Studio: http://localhost:3010
- Database: localhost:5432 (postgres/postgres)

**Login:** admin@church.org / Admin123!

📖 **Documentation:**
- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Sample Data](SAMPLE_DATA.md) - Test data guide
- [Database Credentials](DATABASE_CREDENTIALS.md) - DB access info

## Features

- **Member Management**: Complete CRUD operations for member records with privacy controls
- **Authentication & Security**: JWT-based auth with MFA support, role-based access control
- **Family Relationships**: Track households and family connections with custody indicators
- **Children's Safety**: Specialized child protection features with two-person access requirements
- **Ministry Management**: Groups, serving teams, and ministry program coordination
- **Engagement Tracking**: Monitor member involvement across all church activities
- **Covenant Partnership**: Track member commitments and spiritual growth milestones
- **Mentorship Programs**: Manage mentor-mentee relationships with privacy controls
- **Audit Logging**: Complete audit trail for all sensitive data access
- **Field-Level Encryption**: Sensitive data encrypted at rest

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL 15 (Docker) with Prisma ORM
- **Caching**: Redis for session management
- **Authentication**: JWT with refresh tokens, MFA via TOTP
- **Security**: Helmet.js, bcrypt, field-level encryption (AES-256-GCM)
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for PostgreSQL and Redis)
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd shepherd-app
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` and update the following critical values:
- `JWT_SECRET` - Use a strong random secret
- `JWT_REFRESH_SECRET` - Different from JWT_SECRET
- `ENCRYPTION_KEY` - 32-byte encryption key for sensitive data
- `DATABASE_URL` - PostgreSQL connection string

### 3. Start Database Services

Start the Supabase Postgres and Redis containers:

```bash
npm run docker:up
# or directly with:
docker-compose up -d
```

This starts:
- **PostgreSQL 15** on port 5432 (with uuid-ossp and pgcrypto extensions)
- **Redis** on port 6379
- **Supabase Studio** on port 3010 (database management UI)

Check container status:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f postgres
```

### 4. Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the Application

Development mode with hot reload:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

Once running, access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## Database Management

### Supabase Studio
Access the Supabase Studio UI for database management at:
```
http://localhost:3010
```

Features:
- Browse and edit tables
- Run SQL queries
- View schema and relationships
- Monitor database performance

### Prisma Studio
Alternatively, use Prisma Studio:
```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

### Database Credentials
See [DATABASE_CREDENTIALS.md](DATABASE_CREDENTIALS.md) for complete connection details and access instructions.

## Database Schema

The system includes 20+ tables covering:
- Users (admin staff)
- Members and Households
- Family Relationships
- Children Safety Data
- Connect Groups
- Serving Teams
- Ministry Programs
- Covenant Partnership
- Mentorship Programs
- Audit Logs
- And more...

View the complete schema in `prisma/schema.prisma`

## Security Features

### Authentication
- JWT tokens with 30-minute expiration
- Refresh token rotation
- Multi-factor authentication (TOTP)
- Account lockout after failed attempts

### Authorization
- Role-based access control (5 levels)
- Route-level permission checks
- Two-person access rule for children's data

### Data Protection
- Field-level encryption for sensitive data
- Soft delete with audit trail preservation
- Complete audit logging
- Rate limiting per user role

### Encrypted Fields
- Phone numbers
- Dates of birth
- Medical information
- Emergency contact data
- Pastoral notes

## Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugger

# Build
npm run build              # Compile TypeScript

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio UI (port 5555)

# Docker Services
npm run docker:up          # Start PostgreSQL, Redis & Supabase Studio
npm run docker:down        # Stop all containers
npm run docker:logs        # View logs from all containers
npm run studio             # View Supabase Studio logs

# Testing
npm run test               # Run unit tests
npm run test:cov           # Run with coverage
npm run test:e2e           # Run e2e tests
```

## Project Structure

```
shepherd-app/
├── src/
│   ├── config/           # Configuration files
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── members/      # Member management
│   │   ├── families/     # Household & relationships
│   │   ├── kids/         # Children's ministry
│   │   ├── groups/       # Connect groups
│   │   ├── teams/        # Serving teams
│   │   └── ...
│   ├── common/           # Shared resources
│   │   ├── guards/       # Auth guards
│   │   ├── decorators/   # Custom decorators
│   │   ├── interceptors/ # Audit logging
│   │   └── ...
│   ├── utils/            # Utility functions
│   └── main.ts           # Application entry
├── prisma/               # Database schema & migrations
├── docker-compose.yml    # Docker services
└── README.md
```

## API Documentation

### 📚 **Complete API Reference**

For detailed API documentation with examples, see:
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete endpoint reference with examples
- **[SAMPLE_DATA.md](SAMPLE_DATA.md)** - Test data and usage scenarios
- **Interactive Swagger Docs**: http://localhost:3000/api/docs

### Quick Endpoint Overview

#### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user info
- `POST /mfa/setup` - Setup MFA
- `POST /mfa/verify` - Verify MFA token
- `PATCH /password/change` - Change password

#### Members (`/api/members`)
- `GET /` - List members (with filtering & pagination)
- `GET /:id` - Get member details
- `GET /unconnected` - Members not in groups
- `GET /:id/engagement` - Complete engagement dashboard
- `POST /` - Create member
- `PATCH /:id` - Update member
- `DELETE /:id` - Soft delete member

### Test Credentials

```
Super Admin:      admin@church.org / Admin123!
Pastoral Staff:   pastor@church.org / Admin123!
Admin Staff:      staff@church.org / Admin123!
```

## Core Principles

1. **Privacy First**: Every data point requires justification and consent
2. **Flexibility Over Rigidity**: No forced pathways, track what matters
3. **Admin-Friendly**: Designed for busy staff, not IT professionals
4. **Audit Everything Sensitive**: Complete visibility into data access
5. **Mobile-Responsive**: Admin staff work on tablets and phones

## Development Roadmap

- [x] Phase 1: Foundation (Auth, Members, Database)
- [ ] Phase 2: Family & Household Management
- [ ] Phase 3: Children's Ministry Features
- [ ] Phase 4: Groups, Teams & Ministries
- [ ] Phase 5: Advanced Features (Partnership, Mentorship)
- [ ] Phase 6: Reporting & Analytics
- [ ] Phase 7: Security Hardening
- [ ] Phase 8: Integration & Polish

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Remember**: This is a pastoral care and administrative tool, not a surveillance system. Every feature should help staff serve the church community better while respecting member privacy and consent.
