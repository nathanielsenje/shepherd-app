#!/bin/bash

# Test API Endpoints Script
# This script tests the main endpoints of the Church Integration Management System

API_BASE="http://localhost:3000/api"
TOKEN=""

echo "🧪 Testing Church Integration Management System API"
echo "=================================================="

# Test 1: Root endpoint
echo -e "\n1️⃣  Testing Root Endpoint (GET /api)"
curl -s "$API_BASE" | jq

# Test 2: Health check
echo -e "\n2️⃣  Testing Health Endpoint (GET /api/health)"
curl -s "$API_BASE/health" | jq

# Test 3: Login as Super Admin
echo -e "\n3️⃣  Testing Login (POST /api/auth/login)"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@church.org",
    "password": "Admin123!"
  }')

echo "$LOGIN_RESPONSE" | jq

# Extract access token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ Login successful! Token obtained."
else
  echo "❌ Login failed. Cannot continue with authenticated requests."
  exit 1
fi

# Test 4: Get Current User Info
echo -e "\n4️⃣  Testing Get Current User (GET /api/auth/me)"
curl -s "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 5: List All Members
echo -e "\n5️⃣  Testing List Members (GET /api/members)"
curl -s "$API_BASE/members" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 6: Get Specific Member
echo -e "\n6️⃣  Testing Get Member by ID"
MEMBER_ID=$(curl -s "$API_BASE/members" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

if [ "$MEMBER_ID" != "null" ] && [ -n "$MEMBER_ID" ]; then
  echo "Getting member: $MEMBER_ID"
  curl -s "$API_BASE/members/$MEMBER_ID" \
    -H "Authorization: Bearer $TOKEN" | jq
else
  echo "⚠️  No members found to test"
fi

# Test 7: Get Members Not in Groups
echo -e "\n7️⃣  Testing Get Unconnected Members (GET /api/members/unconnected)"
curl -s "$API_BASE/members/unconnected" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 8: Create a New Member
echo -e "\n8️⃣  Testing Create Member (POST /api/members)"
TIMESTAMP=$(date +%s)
NEW_MEMBER=$(curl -s -X POST "$API_BASE/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"email\": \"test.user.$TIMESTAMP@example.com\",
    \"phone\": \"555-9999\",
    \"status\": \"VISITOR\",
    \"consentDataStorage\": true,
    \"consentCommunication\": true
  }")

echo "$NEW_MEMBER" | jq

NEW_MEMBER_ID=$(echo "$NEW_MEMBER" | jq -r '.id')

if [ "$NEW_MEMBER_ID" != "null" ] && [ -n "$NEW_MEMBER_ID" ]; then
  echo "✅ Member created successfully! ID: $NEW_MEMBER_ID"

  # Test 9: Update the Member
  echo -e "\n9️⃣  Testing Update Member (PATCH /api/members/$NEW_MEMBER_ID)"
  curl -s -X PATCH "$API_BASE/members/$NEW_MEMBER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "NEWCOMER",
      "phone": "555-8888"
    }' | jq

  # Test 10: Get Member Engagement
  echo -e "\n🔟 Testing Get Member Engagement (GET /api/members/$NEW_MEMBER_ID/engagement)"
  curl -s "$API_BASE/members/$NEW_MEMBER_ID/engagement" \
    -H "Authorization: Bearer $TOKEN" | jq

  # Test 11: Soft Delete Member
  echo -e "\n1️⃣1️⃣  Testing Delete Member (DELETE /api/members/$NEW_MEMBER_ID)"
  curl -s -X DELETE "$API_BASE/members/$NEW_MEMBER_ID" \
    -H "Authorization: Bearer $TOKEN" | jq
else
  echo "❌ Member creation failed"
fi

# Test 12: Login as Different Role (Pastoral Staff)
echo -e "\n1️⃣2️⃣  Testing Login as Pastoral Staff"
PASTORAL_LOGIN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pastor@church.org",
    "password": "Admin123!"
  }')

echo "$PASTORAL_LOGIN" | jq

# Test 13: Test Invalid Login
echo -e "\n1️⃣3️⃣  Testing Invalid Login (should fail)"
curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@church.org",
    "password": "WrongPassword"
  }' | jq

echo -e "\n=================================================="
echo "✅ API Testing Complete!"
echo ""
echo "📚 View full API documentation at: http://localhost:3000/api/docs"
