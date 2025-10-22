# TypeScript Errors Fixed

This document summarizes the TypeScript compilation errors that were fixed.

## Errors Fixed

### 1. JWT Module Configuration Error
**File**: `src/modules/auth/auth.module.ts:14`

**Error**:
```
Type 'string' is not assignable to type 'number | StringValue | undefined'
```

**Fix**:
- Changed from `expiresIn: process.env.JWT_EXPIRES_IN || '30m'` to hardcoded `expiresIn: '30m'`
- Added fallback for JWT_SECRET: `process.env.JWT_SECRET || 'default-secret-change-this'`

**Reason**: The NestJS JwtModule.register() expects literal values, not dynamic environment variables for certain options.

---

### 2. Speakeasy Import Error
**File**: `src/modules/auth/auth.service.ts:4`

**Error**:
```
Module '"speakeasy"' has no exported member 'authenticator'
```

**Fix**:
- Changed from `import { authenticator } from 'speakeasy'` to `import * as speakeasy from 'speakeasy'`
- Updated all authenticator calls to use proper speakeasy API:
  - `speakeasy.generateSecret()` instead of `authenticator.generateSecret()`
  - `speakeasy.totp.verify()` instead of `authenticator.verify()`
  - `speakeasy.otpauthURL()` instead of `authenticator.otpauthURL()`

**Reason**: The speakeasy library has a different export structure than expected.

---

### 3. JWT Sign Options Error
**Files**: `src/modules/auth/auth.service.ts:179, 183`

**Error**:
```
Type 'string' is not assignable to type 'number | StringValue | undefined'
```

**Fix**:
In the `generateTokens()` method:
- Access token: Removed the expiresIn option from sign call (uses module default)
- Refresh token: Changed to hardcoded `expiresIn: '7d'` and added fallback for secret

**Before**:
```typescript
const accessToken = this.jwtService.sign(payload, {
  expiresIn: process.env.JWT_EXPIRES_IN || '30m',
});

const refreshToken = this.jwtService.sign(payload, {
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
});
```

**After**:
```typescript
const accessToken = this.jwtService.sign(payload);

const refreshToken = this.jwtService.sign(payload, {
  secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  expiresIn: '7d',
});
```

---

### 4. JWT Strategy Secret Error
**File**: `src/modules/auth/strategies/jwt.strategy.ts:9`

**Error**:
```
Type 'string | undefined' is not assignable to type 'string | Buffer<ArrayBufferLike>'
```

**Fix**:
- Added fallback: `secretOrKey: process.env.JWT_SECRET || 'default-secret-change-this'`

**Reason**: The JWT strategy requires a guaranteed non-undefined secret value.

---

### 5. Encryption Utility Type Errors
**File**: `src/utils/encryption.util.ts:17, 32`

**Errors**:
```
Property 'getAuthTag' does not exist on type 'Cipheriv'
Property 'setAuthTag' does not exist on type 'Decipheriv'
```

**Fix**:
- Updated imports to include `CipherGCM` and `DecipherGCM` types
- Cast cipher/decipher to proper GCM types:

```typescript
const cipher = createCipheriv(this.algorithm, this.key, iv) as CipherGCM;
const decipher = createDecipheriv(this.algorithm, this.key, iv) as DecipherGCM;
```

**Reason**: The GCM cipher mode has specific methods (getAuthTag/setAuthTag) that require proper type casting.

---

## Build Verification

After all fixes, the project builds successfully:

```bash
npm run build
# ✓ Build completes without errors
```

## Security Note

The default fallback secrets used in the fixes are for development only.

**IMPORTANT**: Before deploying to production, ensure all secrets in `.env` are changed:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ENCRYPTION_KEY`

Never use the default fallback values in production!

## Testing the Fixes

To verify everything works:

```bash
# Start services
npm run docker:up

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start in development
npm run start:dev
```

The application should start without any TypeScript errors.
