# Development Guide

Guide for continuing development on the Church Integration Management System.

## Current State

Phase 1 (Foundation) is complete with:
- Authentication & Authorization system
- Member management module
- Database schema (all 20 tables)
- Security infrastructure
- Audit logging
- Field-level encryption

## How to Add New Modules

### Example: Adding the Families Module

#### 1. Create Module Structure

```bash
mkdir -p src/modules/families/dto
touch src/modules/families/families.controller.ts
touch src/modules/families/families.service.ts
touch src/modules/families/families.module.ts
touch src/modules/families/dto/create-household.dto.ts
touch src/modules/families/dto/create-relationship.dto.ts
```

#### 2. Create DTOs

**src/modules/families/dto/create-household.dto.ts**
```typescript
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHouseholdDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  primaryAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  // Add other fields...
}
```

#### 3. Create Service

**src/modules/families/families.service.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { EncryptionUtil } from '../../utils/encryption.util';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  async createHousehold(dto: CreateHouseholdDto) {
    // Encrypt sensitive fields if needed
    const data = { ...dto };
    if (dto.primaryAddress) {
      data.primaryAddress = EncryptionUtil.encrypt(dto.primaryAddress);
    }

    return this.prisma.household.create({ data });
  }

  // Add other methods...
}
```

#### 4. Create Controller

**src/modules/families/families.controller.ts**
```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('families')
export class FamiliesController {
  constructor(private service: FamiliesService) {}

  @Post('households')
  @Roles('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF')
  createHousehold(@Body() dto: CreateHouseholdDto) {
    return this.service.createHousehold(dto);
  }
}
```

#### 5. Create Module

**src/modules/families/families.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';
import { PrismaService } from '../../config/database.config';

@Module({
  controllers: [FamiliesController],
  providers: [FamiliesService, PrismaService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
```

#### 6. Register in App Module

**src/app.module.ts**
```typescript
import { FamiliesModule } from './modules/families/families.module';

@Module({
  imports: [
    // ... existing imports
    FamiliesModule, // Add this
  ],
})
export class AppModule {}
```

## Implementing Security Features

### Adding Audit Logging to a Route

Use the `AuditLogInterceptor`:

```typescript
import { UseInterceptors } from '@nestjs/common';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@Controller('sensitive-data')
@UseInterceptors(AuditLogInterceptor)  // Logs all state-changing operations
export class SensitiveDataController {
  // ...
}
```

### Encrypting Sensitive Fields

```typescript
import { EncryptionUtil } from '../../utils/encryption.util';

// Encrypt before saving
const encrypted = EncryptionUtil.encrypt(sensitiveData);

// Decrypt when reading
const decrypted = EncryptionUtil.decrypt(encryptedData);
```

### Role-Based Access Control

```typescript
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN_STAFF')  // Only these roles can access
@Post('sensitive-operation')
async sensitiveOp() {
  // ...
}
```

## Implementing Two-Person Access Rule

For children's data access, implement a temporary token system:

### 1. Create Access Request Service

```typescript
@Injectable()
export class TwoPersonAccessService {
  constructor(private prisma: PrismaService) {}

  async requestAccess(userId: string, resourceId: string) {
    const token = crypto.randomBytes(32).toString('hex');

    // Store in Redis with 5-minute expiration
    await redis.setex(
      `access:${token}`,
      300,
      JSON.stringify({ userId, resourceId, timestamp: Date.now() })
    );

    return { token, expiresIn: 300 };
  }

  async verifyAccess(token: string, verifierUserId: string) {
    const data = await redis.get(`access:${token}`);
    if (!data) throw new UnauthorizedException('Token expired');

    const { userId, resourceId } = JSON.parse(data);

    if (userId === verifierUserId) {
      throw new ForbiddenException('Cannot verify your own access request');
    }

    // Log both users in audit
    await this.logTwoPersonAccess(userId, verifierUserId, resourceId);

    return { granted: true, resourceId };
  }
}
```

### 2. Use in Controller

```typescript
@Post('kids/:id/request-access')
async requestKidAccess(
  @Param('id') kidId: string,
  @CurrentUser() user: CurrentUserPayload
) {
  return this.twoPersonAccess.requestAccess(user.userId, kidId);
}

@Post('kids/:id/verify-access')
async verifyKidAccess(
  @Param('id') kidId: string,
  @Body('token') token: string,
  @CurrentUser() user: CurrentUserPayload
) {
  await this.twoPersonAccess.verifyAccess(token, user.userId);
  return this.kidsService.findOne(kidId);
}
```

## Database Migrations

### Creating a Migration

After modifying `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

Enter a descriptive name like: `add_email_verification_to_users`

### Viewing Migration Status

```bash
npx prisma migrate status
```

### Rolling Back (Be Careful!)

```bash
npx prisma migrate reset  # Resets database - USE WITH CAUTION
```

## Testing Guidelines

### Unit Test Example

```typescript
// families.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FamiliesService } from './families.service';
import { PrismaService } from '../../config/database.config';

describe('FamiliesService', () => {
  let service: FamiliesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamiliesService,
        {
          provide: PrismaService,
          useValue: {
            household: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FamiliesService>(FamiliesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a household', async () => {
    const dto = { name: 'Test Family' };
    const expected = { id: '1', ...dto };

    jest.spyOn(prisma.household, 'create').mockResolvedValue(expected);

    const result = await service.createHousehold(dto);
    expect(result).toEqual(expected);
  });
});
```

### Integration Test Example

```typescript
// families.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Families (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@church.org', password: 'Admin123!' });

    authToken = loginRes.body.accessToken;
  });

  it('/api/families/households (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/families/households')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Family' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Code Style Guidelines

### 1. File Naming
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Modules: `*.module.ts`
- DTOs: `*.dto.ts`
- Guards: `*.guard.ts`

### 2. Class Naming
- Controllers: `SomethingController`
- Services: `SomethingService`
- DTOs: `CreateSomethingDto`, `UpdateSomethingDto`

### 3. Dependency Injection
Always use constructor injection:

```typescript
@Injectable()
export class SomeService {
  constructor(
    private prisma: PrismaService,
    private otherService: OtherService,
  ) {}
}
```

### 4. Error Handling
Use built-in NestJS exceptions:

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

if (!found) {
  throw new NotFoundException('Resource not found');
}

if (invalid) {
  throw new BadRequestException('Invalid input');
}
```

### 5. DTOs
Always validate input:

```typescript
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSomethingDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}
```

## Common Patterns

### Soft Delete Query

```typescript
async findAll() {
  return this.prisma.member.findMany({
    where: { deletedAt: null },  // Only get non-deleted
  });
}

async softDelete(id: string) {
  return this.prisma.member.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

### Pagination

```typescript
async findAll(page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.member.findMany({ skip, take: limit }),
    this.prisma.member.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Include Related Data

```typescript
async findOne(id: string) {
  return this.prisma.member.findUnique({
    where: { id },
    include: {
      household: true,
      groupMemberships: {
        include: { group: true },
      },
      teamMemberships: {
        include: { team: true },
      },
    },
  });
}
```

## Debugging

### Enable Query Logging

In `database.config.ts`:

```typescript
super({
  datasources: { db: { url: process.env.DATABASE_URL } },
  log: ['query', 'info', 'warn', 'error'],  // Add this
});
```

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/main.ts"],
      "envFile": "${workspaceFolder}/.env",
      "cwd": "${workspaceFolder}",
      "protocol": "inspector"
    }
  ]
}
```

## Performance Optimization

### 1. Use Indexes

In `schema.prisma`:

```prisma
model Member {
  email String? @unique
  status MemberStatus

  @@index([status])  // Add index for frequently queried fields
  @@index([householdId])
}
```

### 2. Select Only Needed Fields

```typescript
async findAll() {
  return this.prisma.member.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      // Only select what you need
    },
  });
}
```

### 3. Use Redis for Caching

```typescript
async findMember(id: string) {
  const cached = await redis.get(`member:${id}`);
  if (cached) return JSON.parse(cached);

  const member = await this.prisma.member.findUnique({ where: { id } });
  await redis.setex(`member:${id}`, 3600, JSON.stringify(member));

  return member;
}
```

## Deployment Checklist

- [ ] Update all secrets in production `.env`
- [ ] Run migrations on production database
- [ ] Set `NODE_ENV=production`
- [ ] Build project: `npm run build`
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Set up log aggregation
- [ ] Configure database backups
- [ ] Test all critical endpoints
- [ ] Load test the application

## Resources

- NestJS Documentation: https://docs.nestjs.com
- Prisma Documentation: https://www.prisma.io/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

## Getting Help

1. Check existing code in `src/modules/auth` and `src/modules/members`
2. Review Prisma schema in `prisma/schema.prisma`
3. Consult the original spec in Desktop `shepherd.md`
4. NestJS Discord: https://discord.gg/nestjs
5. Stack Overflow: Tag with `nestjs` and `prisma`
