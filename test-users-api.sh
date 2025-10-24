#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Users API Endpoints${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Base URL
BASE_URL="http://localhost:3000/api"

# Test 1: Register a new user
echo -e "${BLUE}Test 1: Register new user${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+1234567890"
  }')
echo -e "${GREEN}Response:${NC} $REGISTER_RESPONSE\n"

# Test 2: Login with existing admin user (password from seed script)
echo -e "${BLUE}Test 2: Login as admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@church.org",
    "password": "Admin123!"
  }')
echo -e "${GREEN}Response:${NC} $LOGIN_RESPONSE\n"

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}Failed to login. Cannot continue with authenticated tests.${NC}\n"
  exit 1
fi

echo -e "${GREEN}Access token obtained!${NC}\n"

# Test 3: Get current user profile
echo -e "${BLUE}Test 3: Get current user profile${NC}"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo -e "${GREEN}Response:${NC} $ME_RESPONSE\n"

# Test 4: Get all users (admin only)
echo -e "${BLUE}Test 4: Get all users (admin only)${NC}"
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo -e "${GREEN}Response:${NC} $USERS_RESPONSE\n"

# Test 5: Get user preferences
echo -e "${BLUE}Test 5: Get user preferences${NC}"
PREFS_RESPONSE=$(curl -s -X GET "$BASE_URL/users/me/preferences" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo -e "${GREEN}Response:${NC} $PREFS_RESPONSE\n"

# Test 6: Update user preferences
echo -e "${BLUE}Test 6: Update user preferences${NC}"
UPDATE_PREFS_RESPONSE=$(curl -s -X PATCH "$BASE_URL/users/me/preferences" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "language": "es",
    "notificationEmail": false
  }')
echo -e "${GREEN}Response:${NC} $UPDATE_PREFS_RESPONSE\n"

# Test 7: Update own profile
echo -e "${BLUE}Test 7: Update own profile${NC}"
UPDATE_PROFILE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio for admin user"
  }')
echo -e "${GREEN}Response:${NC} $UPDATE_PROFILE_RESPONSE\n"

# Test 8: Create a new user (admin only)
echo -e "${BLUE}Test 8: Create new user (admin only)${NC}"
CREATE_USER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstaff@church.org",
    "password": "StaffPassword123",
    "firstName": "New",
    "lastName": "Staff",
    "role": "STAFF",
    "status": "ACTIVE"
  }')
echo -e "${GREEN}Response:${NC} $CREATE_USER_RESPONSE\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
