# Quick Start Guide

Get the Church Integration Management System running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Docker Desktop installed and running

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services

```bash
npm run docker:up
```

Wait about 10 seconds for PostgreSQL and Redis to initialize.

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted for a migration name, enter: `init`

### 5. Seed Initial Data

```bash
npm run prisma:seed
```

This creates:
- Default admin user: `admin@church.org` / `Admin123!`
- Sample household and member

### 6. Start the Application

```bash
npm run start:dev
```

The server will start at `http://localhost:3000`

## Testing the API

### 1. Open Swagger Documentation

Navigate to: `http://localhost:3000/api/docs`

### 2. Login

Use the Swagger UI or curl:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@church.org",
    "password": "Admin123!"
  }'
```

You'll receive:
```json
{
  "user": {
    "id": "...",
    "email": "admin@church.org",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "SUPER_ADMIN"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 3. Use the Access Token

Copy the `accessToken` and use it in subsequent requests:

```bash
curl -X GET http://localhost:3000/api/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Or in Swagger UI:
1. Click the "Authorize" button at the top
2. Paste your access token
3. Click "Authorize"

## Common Operations

### Create a Member

```bash
curl -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "status": "VISITOR",
    "consentDataStorage": true
  }'
```

### View Members

```bash
curl -X GET http://localhost:3000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Member Details

```bash
curl -X GET http://localhost:3000/api/members/{member-id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Member Engagement

```bash
curl -X GET http://localhost:3000/api/members/{member-id}/engagement \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. **Explore the API**: Use Swagger UI at `/api/docs` to explore all endpoints
2. **Create Additional Users**: Add more admin staff with different roles
3. **Build Additional Modules**: Implement families, groups, teams modules
4. **Configure Security**: Update JWT secrets and encryption keys in `.env`
5. **Set Up Production**: Configure PostgreSQL for production use

## Troubleshooting

### Docker containers won't start
```bash
# Check Docker is running
docker ps

# Restart containers
npm run docker:down
npm run docker:up
```

### Database connection errors
```bash
# Verify DATABASE_URL in .env
# Default: postgresql://church_admin:secure_password@localhost:5432/church_system

# Check if PostgreSQL is accessible
docker exec -it shepherd-app-postgres-1 psql -U church_admin -d church_system
```

### Prisma errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database (WARNING: destroys all data)
npx prisma migrate reset
```

### Port already in use
```bash
# Change PORT in .env to a different value (e.g., 3001)
# Or kill the process using port 3000
lsof -ti:3000 | xargs kill
```

## Database Management

### View Database in Prisma Studio

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### Create a New Migration

After changing `schema.prisma`:

```bash
npm run prisma:migrate
```

## Stopping the Application

### Stop the Node server
Press `Ctrl+C` in the terminal

### Stop Docker containers
```bash
npm run docker:down
```

## Security Reminder

Before deploying to production:

1. Change all default passwords
2. Generate strong random secrets for:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `ENCRYPTION_KEY`
3. Use environment-specific `.env` files
4. Enable SSL/TLS
5. Configure firewall rules
6. Set up backup procedures

## Additional Resources

- Full documentation: See `README.md`
- API Reference: `http://localhost:3000/api/docs`
- Database Schema: `prisma/schema.prisma`
- Development Guide: See original `shepherd.md` specification
