#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 Testing All APIs - Revathi Enterprises"
echo "=========================================="
echo ""

# Base URL
BASE_URL="http://localhost:3000"

# Test credentials
EMAIL="reddivaridamu25091999@gmail.com"
PASSWORD="121212"

echo -e "${BLUE}📝 Step 1: Testing Login${NC}"
echo "Endpoint: POST /auth/login"
echo "Credentials: $EMAIL / $PASSWORD"
echo ""

# Login and extract token
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
  echo -e "${GREEN}✅ Login Successful${NC}"
  
  # Extract token
  TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract token${NC}"
    exit 1
  fi
  
  echo "Token (first 50 chars): ${TOKEN:0:50}..."
  echo ""
else
  echo -e "${RED}❌ Login Failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

# Function to test API endpoint
test_api() {
  local METHOD=$1
  local ENDPOINT=$2
  local NAME=$3
  local BODY=$4
  
  echo -e "${BLUE}Testing: $NAME${NC}"
  echo "  $METHOD $ENDPOINT"
  
  if [ -z "$BODY" ]; then
    RESPONSE=$(curl -s -X "$METHOD" "$BASE_URL$ENDPOINT" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -w "\nHTTP_CODE:%{http_code}")
  else
    RESPONSE=$(curl -s -X "$METHOD" "$BASE_URL$ENDPOINT" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$BODY" \
      -w "\nHTTP_CODE:%{http_code}")
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
  RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "  ${GREEN}✅ Status: $HTTP_CODE${NC}"
  elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "  ${RED}❌ Status: $HTTP_CODE (Unauthorized)${NC}"
  else
    echo -e "  ${YELLOW}⚠️  Status: $HTTP_CODE${NC}"
  fi
  
  echo ""
}

echo "=========================================="
echo -e "${BLUE}📝 Step 2: Testing Authentication Endpoints${NC}"
echo "=========================================="
echo ""

test_api "GET" "/auth/profile" "Get User Profile"

echo "=========================================="
echo -e "${BLUE}📊 Step 3: Testing Dashboard Endpoints${NC}"
echo "=========================================="
echo ""

test_api "GET" "/dashboard/stats" "Dashboard Statistics"

echo "=========================================="
echo -e "${BLUE}👥 Step 4: Testing Users Endpoints${NC}"
echo "=========================================="
echo ""

test_api "GET" "/users" "Get All Users"

echo "=========================================="
echo -e "${BLUE}📦 Step 5: Testing Products Endpoints${NC}"
echo "=========================================="
echo ""

test_api "GET" "/products" "Get All Products"

echo "=========================================="
echo -e "${BLUE}🏷️  Step 6: Testing Variants Endpoints${NC}"
echo "=========================================="
echo ""

test_api "GET" "/variants" "Get All Variants"

echo "=========================================="
echo -e "${BLUE}💰 Step 7: Testing Sales Endpoints${NC}"
echo "=========================================="
echo ""

test_api "GET" "/sales" "Get All Sales"

echo "=========================================="
echo -e "${BLUE}🤝 Step 8: Testing Customers Endpoints${NC}"
echo "=========================================="
echo ""

test_api "GET" "/customers" "Get All Customers"

echo "=========================================="
echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "- All tests have been executed"
echo "- Check the results above for any failures"
echo "- Any 401 errors indicate authentication issues"
echo "- Any 404 errors indicate missing endpoints"
echo ""

