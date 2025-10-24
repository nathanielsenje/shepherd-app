# API Documentation

## Overview

The Church Integration Management System API is a RESTful API built with NestJS that provides endpoints for managing church members, families, groups, teams, and ministries.

**Base URL**: `http://localhost:3000/api`

**Interactive Documentation**: http://localhost:3000/api/docs (Swagger UI)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Members](#members)
4. [Authorization & Roles](#authorization--roles)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Audit Logging](#audit-logging)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header.

### Login

**POST** `/api/auth/login`

Authenticate a user and receive access and refresh tokens.

**Request Body:**
```json
{
  "email": "admin@church.org",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid",
    "email": "admin@church.org",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "SUPER_ADMIN"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@church.org",
    "password": "Admin123!"
  }'
```

---

### Refresh Token

**POST** `/api/auth/refresh`

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

---

### Get Current User

**GET** `/api/auth/me`

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "userId": "uuid",
  "email": "admin@church.org",
  "role": "SUPER_ADMIN",
  "iat": 1234567890,
  "exp": 1234569690
}
```

---

### Setup MFA

**POST** `/api/auth/mfa/setup`

Setup multi-factor authentication for the current user.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

---

### Verify MFA

**POST** `/api/auth/mfa/verify`

Verify and enable MFA with a TOTP token.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "token": "123456"
}
```

---

### Change Password

**PATCH** `/api/auth/password/change`

Change the password for the current user.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "oldPassword": "Admin123!",
  "newPassword": "NewPassword123!"
}
```

---

### Register

**POST** `/api/auth/register`

Register a new user account. New users start with PENDING status and require email verification + admin approval.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "uuid"
}
```

---

### Verify Email

**POST** `/api/auth/verify-email`

Verify email address using the token sent to user's email.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully. Your account is pending admin approval."
}
```

---

### Forgot Password

**POST** `/api/auth/forgot-password`

Request a password reset link.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

---

### Reset Password

**POST** `/api/auth/reset-password`

Reset password using the token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

### Logout

**POST** `/api/auth/logout`

Logout and invalidate the refresh token.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Users

### Get All Users

**GET** `/api/users`

Get a list of all system users. Only accessible by Super Admin and Admin roles.

**Required Role:** `SUPER_ADMIN` or `ADMIN`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "admin@church.org",
    "firstName": "System",
    "lastName": "Administrator",
    "phoneNumber": null,
    "photo": null,
    "bio": null,
    "role": "SUPER_ADMIN",
    "status": "ACTIVE",
    "emailVerified": true,
    "lastLogin": "2025-10-24T14:56:48.332Z",
    "createdAt": "2025-10-23T11:36:50.470Z",
    "updatedAt": "2025-10-24T14:56:48.333Z"
  }
]
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users
```

---

### Get Current User Profile

**GET** `/api/users/me`

Get the authenticated user's full profile including preferences.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "photo": "https://example.com/photo.jpg",
  "bio": "My bio",
  "role": "STAFF",
  "status": "ACTIVE",
  "emailVerified": true,
  "mfaEnabled": false,
  "lastLogin": "2025-10-24T12:00:00.000Z",
  "createdAt": "2025-10-23T11:36:50.470Z",
  "updatedAt": "2025-10-24T12:00:00.000Z",
  "preferences": {
    "id": "uuid",
    "userId": "uuid",
    "language": "en",
    "theme": "light",
    "notificationEmail": true,
    "notificationPush": true,
    "notificationSms": false
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/me
```

---

### Update Own Profile

**PATCH** `/api/users/me`

Update your own user profile. Regular users cannot change role or status.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phoneNumber": "+0987654321",
  "photo": "https://example.com/new-photo.jpg",
  "bio": "Updated bio"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phoneNumber": "+0987654321",
  "photo": "https://example.com/new-photo.jpg",
  "bio": "Updated bio",
  "role": "STAFF",
  "status": "ACTIVE",
  "updatedAt": "2025-10-24T12:00:00.000Z"
}
```

---

### Get User Preferences

**GET** `/api/users/me/preferences`

Get the authenticated user's preferences. Creates default preferences if they don't exist.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "language": "en",
  "theme": "light",
  "notificationEmail": true,
  "notificationPush": true,
  "notificationSms": false,
  "createdAt": "2025-10-24T12:00:00.000Z",
  "updatedAt": "2025-10-24T12:00:00.000Z"
}
```

---

### Update User Preferences

**PATCH** `/api/users/me/preferences`

Update the authenticated user's preferences.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body (all fields optional):**
```json
{
  "language": "es",
  "theme": "dark",
  "notificationEmail": false,
  "notificationPush": true,
  "notificationSms": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "language": "es",
  "theme": "dark",
  "notificationEmail": false,
  "notificationPush": true,
  "notificationSms": false,
  "updatedAt": "2025-10-24T12:00:00.000Z"
}
```

---

### Create User (Admin)

**POST** `/api/users`

Create a new user. Only accessible by Admin roles. Admin-created users are automatically verified and can be set to ACTIVE immediately.

**Required Role:** `SUPER_ADMIN` or `ADMIN`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "email": "newstaff@church.org",
  "password": "SecurePassword123",
  "firstName": "New",
  "lastName": "Staff",
  "phoneNumber": "+1234567890",
  "role": "STAFF",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "newstaff@church.org",
  "firstName": "New",
  "lastName": "Staff",
  "phoneNumber": "+1234567890",
  "photo": null,
  "bio": null,
  "role": "STAFF",
  "status": "ACTIVE",
  "createdAt": "2025-10-24T12:00:00.000Z"
}
```

---

### Get User by ID

**GET** `/api/users/:id`

Get details of a specific user by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "photo": "https://example.com/photo.jpg",
  "bio": "My bio",
  "role": "STAFF",
  "status": "ACTIVE",
  "emailVerified": true,
  "mfaEnabled": false,
  "lastLogin": "2025-10-24T12:00:00.000Z",
  "createdAt": "2025-10-23T11:36:50.470Z",
  "updatedAt": "2025-10-24T12:00:00.000Z",
  "preferences": {
    "language": "en",
    "theme": "light",
    "notificationEmail": true
  }
}
```

---

### Update User (Admin)

**PATCH** `/api/users/:id`

Update any user's information. Only accessible by Admin roles. Admins can change roles and status.

**Required Role:** `SUPER_ADMIN` or `ADMIN`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Updated",
  "role": "MINISTRY_LEADER",
  "status": "ACTIVE",
  "bio": "Updated by admin"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Updated",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "photo": "https://example.com/photo.jpg",
  "bio": "Updated by admin",
  "role": "MINISTRY_LEADER",
  "status": "ACTIVE",
  "updatedAt": "2025-10-24T12:00:00.000Z"
}
```

---

### Delete User (Admin)

**DELETE** `/api/users/:id`

Delete a user from the system. Only accessible by Admin roles.

**Required Role:** `SUPER_ADMIN` or `ADMIN`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

### Approve Pending User (Admin)

**PATCH** `/api/users/:id/approve`

Approve a pending user and change their status to ACTIVE. User must have verified their email before approval.

**Required Role:** `SUPER_ADMIN` or `ADMIN`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "ACTIVE"
}
```

---

## Members

### Create Member

**POST** `/api/members`

Create a new member record.

**Required Role:** `SUPER_ADMIN`, `ADMIN`, or `STAFF`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-1234",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "status": "VISITOR",
  "householdId": "uuid-optional",
  "isChild": false,
  "consentDataStorage": true,
  "consentCommunication": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-1234",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "status": "VISITOR",
  "householdId": null,
  "isChild": false,
  "consentDataStorage": true,
  "consentCommunication": true,
  "consentDate": "2024-10-23T12:00:00.000Z",
  "createdAt": "2024-10-23T12:00:00.000Z",
  "updatedAt": "2024-10-23T12:00:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "status": "VISITOR",
    "consentDataStorage": true,
    "consentCommunication": true
  }'
```

---

### Get All Members

**GET** `/api/members`

Retrieve a list of all members with optional filtering and pagination.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): Filter by member status (NEWCOMER, VISITOR, REGULAR_ATTENDER, MEMBER, INACTIVE)
- `isChild` (optional): Filter by child status (true/false)
- `householdId` (optional): Filter by household ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "phone": "555-1001",
      "status": "MEMBER",
      "household": {
        "id": "uuid",
        "name": "Smith Family"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**Examples:**
```bash
# Get all members
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/members

# Get only visitors
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/members?status=VISITOR"

# Get children only
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/members?isChild=true"

# Paginated results
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/members?page=1&limit=20"
```

---

### Get Member by ID

**GET** `/api/members/:id`

Retrieve detailed information about a specific member.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "phone": "555-1001",
  "dateOfBirth": "1985-03-15",
  "gender": "Male",
  "status": "MEMBER",
  "householdId": "uuid",
  "household": {
    "id": "uuid",
    "name": "Smith Family",
    "primaryAddress": "123 Oak Street",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  },
  "firstVisitDate": "2020-01-15T00:00:00.000Z",
  "isChild": false,
  "consentDataStorage": true,
  "consentCommunication": true,
  "createdAt": "2020-01-15T00:00:00.000Z",
  "updatedAt": "2024-10-23T12:00:00.000Z"
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/members/123e4567-e89b-12d3-a456-426614174000
```

---

### Get Unconnected Members

**GET** `/api/members/unconnected`

Get a list of members who are not part of any connect group.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Sarah",
      "lastName": "Miller",
      "email": "sarah.miller@example.com",
      "status": "VISITOR",
      "firstVisitDate": "2024-09-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/members/unconnected
```

---

### Get Member Engagement

**GET** `/api/members/:id/engagement`

Get a comprehensive engagement dashboard for a member showing their involvement in groups, teams, ministries, and milestones.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "member": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Smith",
    "status": "MEMBER"
  },
  "engagement": {
    "connectGroups": [
      {
        "id": "uuid",
        "groupName": "North Springfield Group",
        "role": "LEADER",
        "joinDate": "2020-07-15T00:00:00.000Z"
      }
    ],
    "servingTeams": [
      {
        "id": "uuid",
        "teamName": "Worship Team",
        "rolePosition": "Worship Leader",
        "onboardingCompleted": true,
        "backgroundCheckStatus": "NOT_REQUIRED"
      }
    ],
    "ministries": [
      {
        "id": "uuid",
        "ministryName": "Young Adults Ministry",
        "role": "LEADER"
      }
    ],
    "milestones": [
      {
        "id": "uuid",
        "milestoneType": "FIRST_VISIT",
        "status": "COMPLETED",
        "achievedDate": "2020-01-15T00:00:00.000Z"
      },
      {
        "id": "uuid",
        "milestoneType": "COVENANT_PARTNER",
        "status": "COMPLETED",
        "achievedDate": "2020-06-01T00:00:00.000Z"
      }
    ],
    "covenantPartnership": {
      "status": "ACTIVE",
      "signatureDate": "2020-06-01T00:00:00.000Z"
    },
    "skills": [
      {
        "skillName": "Leadership",
        "proficiencyLevel": "Advanced",
        "availableToServe": true
      }
    ]
  },
  "summary": {
    "totalGroups": 1,
    "totalTeams": 1,
    "totalMinistries": 1,
    "completedMilestones": 4,
    "isCovenantPartner": true
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/members/123e4567-e89b-12d3-a456-426614174000/engagement
```

---

### Update Member

**PATCH** `/api/members/:id`

Update an existing member's information.

**Required Role:** `SUPER_ADMIN`, `ADMIN`, or `STAFF`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Jonathan",
  "status": "REGULAR_ATTENDER",
  "phone": "555-9999",
  "email": "new.email@example.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "Jonathan",
  "lastName": "Smith",
  "status": "REGULAR_ATTENDER",
  "phone": "555-9999",
  "email": "new.email@example.com",
  "updatedAt": "2024-10-23T12:00:00.000Z"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/members/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "MEMBER",
    "phone": "555-8888"
  }'
```

---

### Delete Member

**DELETE** `/api/members/:id`

Soft delete a member (sets deletedAt timestamp, preserves audit trail).

**Required Role:** `SUPER_ADMIN` or `ADMIN`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "message": "Member soft deleted successfully",
  "id": "uuid",
  "deletedAt": "2024-10-23T12:00:00.000Z"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/members/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Authorization & Roles

The system uses role-based access control (RBAC) with the following roles:

| Role | Description | Permissions |
|------|-------------|-------------|
| `SUPER_ADMIN` | System Administrator | Full access to all endpoints, data, and user management |
| `ADMIN` | Administrative Staff | Can create, update, delete members and users; Can approve users |
| `STAFF` | Church Staff | Can create, update, and view members; Can manage own profile |
| `MINISTRY_LEADER` | Ministry Leaders | Can view members and manage their specific ministry |
| `VOLUNTEER` | Volunteers | Basic access to view data relevant to their assignments |

### User Status

| Status | Description |
|--------|-------------|
| `ACTIVE` | User can fully access the system |
| `PENDING` | User registered but awaiting admin approval (can login but limited to viewing only) |
| `INACTIVE` | User account is disabled |

### Protected Endpoints

Endpoints are protected using guards:

1. **JwtAuthGuard** - Requires valid authentication token
2. **RolesGuard** - Requires specific role(s)

Example protected endpoint:
```typescript
@Post()
@Roles('SUPER_ADMIN', 'ADMIN_STAFF', 'PASTORAL_STAFF')
create(@Body() createMemberDto: CreateMemberDto) {
  // Only SUPER_ADMIN, ADMIN_STAFF, or PASTORAL_STAFF can access
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns errors in a consistent format.

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Example Error Responses

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Insufficient permissions for this operation"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Member not found",
  "error": "Not Found"
}
```

**400 Validation Error:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "firstName should not be empty"
  ],
  "error": "Bad Request"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse.

**Default Limits:**
- Window: 15 minutes (900,000 ms)
- Max Requests: 100 per window per IP

When limit is exceeded:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698765432
```

---

## Audit Logging

All sensitive operations are automatically logged for audit purposes.

### Logged Operations

- Member creation, updates, and deletions
- Authentication events (login, logout, MFA setup)
- Password changes
- Sensitive data access

### Audit Log Fields

- `userId` - User who performed the action
- `action` - Type of action (CREATE, UPDATE, DELETE, VIEW)
- `resourceType` - Type of resource (Member, User, etc.)
- `resourceId` - ID of affected resource
- `ipAddress` - IP address of the request
- `userAgent` - User agent string
- `timestamp` - When the action occurred
- `details` - Additional contextual information

---

## Data Models

### Member Status Enum

```typescript
enum MemberStatus {
  NEWCOMER        // First-time visitor
  VISITOR         // Has visited multiple times
  REGULAR_ATTENDER // Attends regularly but not a member
  MEMBER          // Official church member
  INACTIVE        // No longer active
}
```

### Milestone Types

```typescript
enum MilestoneType {
  FIRST_VISIT
  GROWTH_TRACK
  COVENANT_PARTNER
  SMALL_GROUP
  SERVING_TEAM
  REGULAR_GIVING
}
```

### Group Types

```typescript
enum GroupType {
  GEOGRAPHIC      // Based on location
  AFFINITY        // Based on interests
  LIFE_STAGE      // Based on age/life stage
  OTHER
}
```

---

## Testing with Sample Data

The database has been seeded with test data. See [SAMPLE_DATA.md](SAMPLE_DATA.md) for details.

### Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@church.org | Admin123! | SUPER_ADMIN |
| pastor@church.org | Admin123! | PASTORAL_STAFF |
| staff@church.org | Admin123! | ADMIN_STAFF |

---

## Complete API Reference

### Root Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API information and status |
| GET | `/api/health` | Health check endpoint |
| GET | `/api/docs` | Interactive Swagger documentation |

### Authentication Endpoints

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| POST | `/api/auth/login` | No | - | User login |
| POST | `/api/auth/register` | No | - | Register new user (pending approval) |
| POST | `/api/auth/verify-email` | No | - | Verify email with token |
| POST | `/api/auth/forgot-password` | No | - | Request password reset |
| POST | `/api/auth/reset-password` | No | - | Reset password with token |
| POST | `/api/auth/logout` | Yes | All | Logout and invalidate token |
| POST | `/api/auth/refresh` | No | - | Refresh access token |
| GET | `/api/auth/me` | Yes | All | Get current user info |
| POST | `/api/auth/mfa/setup` | Yes | All | Setup MFA |
| POST | `/api/auth/mfa/verify` | Yes | All | Verify MFA token |
| PATCH | `/api/auth/password/change` | Yes | All | Change password |

### User Endpoints

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| GET | `/api/users` | Yes | Super Admin, Admin | List all users |
| GET | `/api/users/me` | Yes | All | Get current user profile |
| PATCH | `/api/users/me` | Yes | All (Active only) | Update own profile |
| GET | `/api/users/me/preferences` | Yes | All | Get user preferences |
| PATCH | `/api/users/me/preferences` | Yes | All (Active only) | Update preferences |
| POST | `/api/users` | Yes | Super Admin, Admin | Create new user |
| GET | `/api/users/:id` | Yes | All | Get user by ID |
| PATCH | `/api/users/:id` | Yes | Super Admin, Admin | Update any user |
| DELETE | `/api/users/:id` | Yes | Super Admin, Admin | Delete user |
| PATCH | `/api/users/:id/approve` | Yes | Super Admin, Admin | Approve pending user |

### Member Endpoints

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| POST | `/api/members` | Yes | Super Admin, Admin, Staff | Create member |
| GET | `/api/members` | Yes | All (inc. Pending) | List all members |
| GET | `/api/members/unconnected` | Yes | All (inc. Pending) | Get unconnected members |
| GET | `/api/members/:id` | Yes | All (inc. Pending) | Get member by ID |
| GET | `/api/members/:id/engagement` | Yes | All (inc. Pending) | Get member engagement |
| PATCH | `/api/members/:id` | Yes | Super Admin, Admin, Staff | Update member |
| DELETE | `/api/members/:id` | Yes | Super Admin, Admin | Soft delete member |

---

## Best Practices

### 1. Always Use HTTPS in Production
```bash
# Production
https://api.yourchurch.org/api

# Development
http://localhost:3000/api
```

### 2. Store Tokens Securely
- Never store tokens in localStorage (vulnerable to XSS)
- Use httpOnly cookies or secure storage
- Implement token refresh logic

### 3. Handle Token Expiration
```javascript
// Example: Refresh token when expired
if (error.status === 401) {
  const newToken = await refreshAccessToken();
  retry(originalRequest, newToken);
}
```

### 4. Validate Input on Client Side
Before sending requests, validate:
- Email format
- Required fields
- Data types
- Field lengths

### 5. Use Pagination for Large Datasets
```bash
# Always paginate when fetching large lists
curl "http://localhost:3000/api/members?page=1&limit=50"
```

### 6. Log Errors Properly
Don't expose sensitive information in error messages.

---

## Support

For issues, questions, or feature requests:
- GitHub Issues: [Your Repository]
- Documentation: http://localhost:3000/api/docs
- Database Credentials: See [DATABASE_CREDENTIALS.md](DATABASE_CREDENTIALS.md)
- Sample Data: See [SAMPLE_DATA.md](SAMPLE_DATA.md)

---

**Last Updated:** October 24, 2025
**API Version:** 1.0
**NestJS Version:** 11.x

## Summary of Changes

### October 24, 2025 (Updated)

**Added Users API:**
- User registration with email verification
- Password reset functionality
- User profile management
- User preferences (language, theme, notifications)
- Admin user management (CRUD operations)
- User approval workflow for new registrations
- Enhanced authentication with logout and token management
- PendingUserGuard to restrict pending users to read-only access

**Database Updates:**
- Added `UserStatus` enum (ACTIVE, PENDING, INACTIVE)
- Updated `UserRole` enum (SUPER_ADMIN, ADMIN, STAFF, MINISTRY_LEADER, VOLUNTEER)
- Added user fields: phoneNumber, photo, bio, status, emailVerified, verification/reset tokens
- Created `UserPreferences` table
- Created `RefreshToken` table for token management

**New Guards:**
- `RolesGuard` - Role-based access control
- `PendingUserGuard` - Restricts pending users to read-only operations

**Critical Fixes:**
- ✅ Updated Members controller to use new UserRole enum values
- ✅ Added PendingUserGuard to Members controller
- ✅ Added @AllowPending decorators to all GET endpoints in Members controller
- ✅ Fixed authorization issues where ADMIN and STAFF roles couldn't manage members
