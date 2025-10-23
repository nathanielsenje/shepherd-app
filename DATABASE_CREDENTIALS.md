# Database Credentials & Access

## PostgreSQL Credentials

### Connection Details
```
Host: localhost
Port: 5432
Database: shepherd_db
Username: postgres
Password: postgres
```

### Connection String
```
postgresql://postgres:postgres@localhost:5432/shepherd_db
```

### Direct Database Access

**Using psql (PostgreSQL CLI):**
```bash
psql postgresql://postgres:postgres@localhost:5432/shepherd_db
```

**Using Docker exec:**
```bash
docker exec -it shepherd_postgres psql -U postgres -d shepherd_db
```

**Using pgAdmin or other GUI tools:**
- Host: `localhost`
- Port: `5432`
- Database: `shepherd_db`
- Username: `postgres`
- Password: `postgres`

---

## Supabase Studio

### Access URL
```
http://localhost:3010
```

### Features Available in Studio
- **Table Editor**: Browse and edit data in your tables
- **SQL Editor**: Run custom SQL queries
- **Database**: View schema, relationships, and indexes
- **API Docs**: Auto-generated API documentation
- **Database Policies**: (Not fully featured in local setup)

### Starting Supabase Studio

1. **Start all services:**
   ```bash
   npm run docker:up
   ```

2. **Open Studio in browser:**
   ```
   http://localhost:3010
   ```

3. **View Studio logs:**
   ```bash
   npm run studio
   # or
   docker-compose logs -f studio
   ```

### Studio Connection Info
- **Database URL**: `postgresql://postgres:postgres@postgres:5432/shepherd_db`
- **ANON Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`

> **Note**: These are demo keys for local development only. Never use these in production.

---

## Redis Credentials

### Connection Details
```
Host: localhost
Port: 6379
Password: (none)
```

### Connection String
```
redis://localhost:6379
```

### Direct Redis Access

**Using redis-cli:**
```bash
docker exec -it shepherd_redis redis-cli
```

---

## Docker Container Management

### Start Services
```bash
npm run docker:up
# or
docker-compose up -d
```

### Stop Services
```bash
npm run docker:down
# or
docker-compose down
```

### View All Logs
```bash
npm run docker:logs
# or
docker-compose logs -f
```

### View Specific Container Logs
```bash
docker-compose logs -f postgres
docker-compose logs -f studio
docker-compose logs -f redis
```

### Check Container Status
```bash
docker-compose ps
```

### Restart a Service
```bash
docker-compose restart postgres
docker-compose restart studio
docker-compose restart redis
```

---

## Service URLs Summary

| Service | URL | Port |
|---------|-----|------|
| **Your NestJS App** | http://localhost:3000 | 3000 |
| **API Documentation** | http://localhost:3000/api/docs | 3000 |
| **Supabase Studio** | http://localhost:3010 | 3010 |
| **PostgreSQL** | postgresql://localhost:5432 | 5432 |
| **Redis** | redis://localhost:6379 | 6379 |
| **Prisma Studio** | http://localhost:5555 | 5555 |

---

## Troubleshooting

### Studio won't load
1. Check if postgres container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check studio logs:
   ```bash
   docker-compose logs studio
   ```

3. Restart the studio container:
   ```bash
   docker-compose restart studio
   ```

### Cannot connect to database
1. Ensure containers are running:
   ```bash
   docker-compose ps
   ```

2. Check postgres logs:
   ```bash
   docker-compose logs postgres
   ```

3. Test connection:
   ```bash
   docker exec -it shepherd_postgres pg_isready -U postgres
   ```

### Port already in use
If port 5432, 6379, or 3010 is already in use, you can change the ports in `docker-compose.yml`:
```yaml
ports:
  - '5433:5432'  # Change left side to available port
```

---

## Security Notes

⚠️ **Important**: These credentials are for LOCAL DEVELOPMENT ONLY.

For production:
- Use strong, unique passwords
- Never commit credentials to version control
- Use environment variables
- Enable SSL/TLS for database connections
- Restrict network access
- Use proper authentication keys (not demo keys)
