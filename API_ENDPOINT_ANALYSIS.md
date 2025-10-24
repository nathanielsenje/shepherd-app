# API Endpoint Analysis & Review

**Date:** October 24, 2025
**Reviewed By:** Claude
**Status:** ⚠️ Issues Found - Action Required

---

## Summary

Total Endpoints: **29**
- Root/Health: 2
- Authentication: 11
- Users: 10
- Members: 7

---

## 🔴 CRITICAL ISSUES

### 1. **Role Name Mismatch in Members Controller**

**Severity:** CRITICAL - Will cause authorization failures

**Issue:** The Members controller still uses old UserRole enum values that no longer exist in the database:
- `ADMIN_STAFF` (should be `ADMIN`)
- `PASTORAL_STAFF` (should be `STAFF`)

**Location:** `src/modules/members/members.controller.ts`

**Lines Affected:**
- Line 30: `@Roles('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF')`
- Line 78: `@Roles('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF')`
- Line 85: `@Roles('SUPER_ADMIN', 'ADMIN_STAFF')`

**Impact:**
- Users with ADMIN or STAFF roles cannot create, update, or delete members
- Only SUPER_ADMIN can currently perform these operations
- Authorization will fail for valid users

**Fix Required:**
```typescript
// Current (BROKEN):
@Roles('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF')

// Should be:
@Roles('SUPER_ADMIN', 'ADMIN', 'STAFF')
```

---

## ⚠️ HIGH PRIORITY ISSUES

### 2. **Missing PendingUserGuard on Members Controller**

**Severity:** HIGH - Security/UX issue

**Issue:** The Members controller doesn't use `PendingUserGuard`, meaning pending users can create/update/delete church members even though they're awaiting approval.

**Location:** `src/modules/members/members.controller.ts` Line 23

**Current:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```

**Should be:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard, PendingUserGuard)
```

**Impact:**
- Pending users can mutate member data before being approved
- Inconsistent with the design where pending users should be read-only

---

## ℹ️ OBSERVATIONS & RECOMMENDATIONS

### 3. **Endpoint Overlap: /api/auth/me vs /api/users/me**

**Severity:** LOW - Potential confusion

**Current State:**
- `GET /api/auth/me` - Returns JWT payload (basic user info from token)
- `GET /api/users/me` - Returns full user profile with preferences

**Analysis:**
- These serve different purposes but could confuse API consumers
- Both are valid and useful, but naming could be clearer

**Recommendation:**
- Keep both endpoints as they serve distinct purposes
- Document clearly in API docs what each returns
- Consider deprecating `/api/auth/me` in favor of `/api/users/me` in future versions

---

### 4. **RESTful Consistency**

**Severity:** INFO

**Good Practices Followed:**
✅ Proper HTTP verb usage (GET, POST, PATCH, DELETE)
✅ Resource-based URLs (/users, /members)
✅ Parameterized routes for specific resources (:id)
✅ Query parameters for filtering (status, isChild, etc.)
✅ Nested resources for sub-resources (me/preferences)

**Minor Deviations (Acceptable):**
- Auth endpoints are action-based (login, register, verify-email) - This is standard for authentication
- Special action endpoints like `/approve` - Common pattern for workflow actions

**Assessment:** Overall RESTful design is solid

---

### 5. **Route Ordering**

**Severity:** INFO

**Analysis:** Route ordering is correct! More specific routes are defined before parameterized ones:

**Good Examples:**
```
✅ /users/me comes before /users/:id
✅ /users/me/preferences comes before /users/:id
✅ /members/unconnected comes before /members/:id
```

This prevents route conflicts where `:id` would match literal paths.

---

## 📊 Complete Endpoint Inventory

### Root & Health (2)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api` | No | API info |
| GET | `/api/health` | No | Health check |

### Authentication (11)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | No | User login |
| POST | `/api/auth/register` | No | User registration |
| POST | `/api/auth/verify-email` | No | Email verification |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/auth/me` | Yes | Current user (from token) |
| POST | `/api/auth/mfa/setup` | Yes | Setup MFA |
| POST | `/api/auth/mfa/verify` | Yes | Verify MFA |
| PATCH | `/api/auth/password/change` | Yes | Change password |

### Users (10)
| Method | Endpoint | Auth | Roles | Purpose |
|--------|----------|------|-------|---------|
| GET | `/api/users` | Yes | SUPER_ADMIN, ADMIN | List all users |
| GET | `/api/users/me` | Yes | All | Get own profile |
| PATCH | `/api/users/me` | Yes | All (Active) | Update own profile |
| GET | `/api/users/me/preferences` | Yes | All | Get preferences |
| PATCH | `/api/users/me/preferences` | Yes | All (Active) | Update preferences |
| POST | `/api/users` | Yes | SUPER_ADMIN, ADMIN | Create user |
| GET | `/api/users/:id` | Yes | All | Get user by ID |
| PATCH | `/api/users/:id` | Yes | SUPER_ADMIN, ADMIN | Update user |
| DELETE | `/api/users/:id` | Yes | SUPER_ADMIN, ADMIN | Delete user |
| PATCH | `/api/users/:id/approve` | Yes | SUPER_ADMIN, ADMIN | Approve pending user |

### Members (7)
| Method | Endpoint | Auth | Roles (BROKEN) | Purpose |
|--------|----------|------|----------------|---------|
| POST | `/api/members` | Yes | ⚠️ OLD ROLES | Create member |
| GET | `/api/members` | Yes | All | List members |
| GET | `/api/members/unconnected` | Yes | All | Unconnected members |
| GET | `/api/members/:id` | Yes | All | Get member |
| GET | `/api/members/:id/engagement` | Yes | All | Member engagement |
| PATCH | `/api/members/:id` | Yes | ⚠️ OLD ROLES | Update member |
| DELETE | `/api/members/:id` | Yes | ⚠️ OLD ROLES | Delete member |

---

## 🎯 Action Items

### Must Fix Immediately:

1. ✅ **Update Members controller role guards** to use new role names
2. ✅ **Add PendingUserGuard** to Members controller

### Should Consider:

3. Add batch operations endpoints for bulk user/member management
4. Add search endpoint: `GET /api/users/search?q=...`
5. Add search endpoint: `GET /api/members/search?q=...`
6. Consider adding `PATCH /api/users/me/password` as an alias to `/api/auth/password/change` for consistency

### Nice to Have:

7. Add endpoint for admins to resend verification emails: `POST /api/users/:id/resend-verification`
8. Add endpoint to list pending users: `GET /api/users?status=PENDING` (can already be done but not documented)
9. Add avatar upload endpoint: `POST /api/users/me/avatar`

---

## ✅ What's Working Well

1. **RESTful Design:** Clean resource-based URLs
2. **Route Ordering:** Specific routes before parameterized ones
3. **Guard Usage:** Proper authentication and role-based authorization
4. **HTTP Verbs:** Correct usage of GET, POST, PATCH, DELETE
5. **Swagger Documentation:** All endpoints are properly annotated
6. **Filtering:** Query parameters for flexible filtering
7. **Nested Resources:** Logical sub-resource structure (me/preferences)

---

## 📝 Recommendations Summary

**Immediate (Critical):**
- Fix role name mismatches in Members controller
- Add PendingUserGuard to Members controller

**Short Term:**
- Add clear documentation distinguishing /api/auth/me from /api/users/me
- Consider deprecation path for /api/auth/me

**Long Term:**
- Add search endpoints
- Add batch operations
- Add file upload for avatars
- Add more workflow actions (resend-verification, etc.)

---

**Overall Assessment:** The API is well-designed and follows best practices. The critical issues are quick fixes that should be addressed immediately. Once fixed, the API will be production-ready.
