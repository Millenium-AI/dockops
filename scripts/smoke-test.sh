#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 DockOps Smoke Tests${NC}"
echo "=========================="

# Check environment
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL not set${NC}"
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo -e "${YELLOW}⚠️  JWT_SECRET not set, using default${NC}"
  export JWT_SECRET="test-secret-key"
fi

# Clean build
echo -e "\n${YELLOW}1️⃣  Building...${NC}"
npm run build > /dev/null 2>&1 && echo -e "${GREEN}✅ Build succeeded${NC}" || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }

# Start server
echo -e "\n${YELLOW}2️⃣  Starting server...${NC}"
npm start &
SERVER_PID=$!
sleep 3

# Function to cleanup on exit
cleanup() {
  kill $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

# Health check
echo -e "\n${YELLOW}3️⃣  Health check...${NC}"
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Server responding${NC}"
else
  echo -e "${RED}❌ Server not responding${NC}"
  exit 1
fi

# Migrations
echo -e "\n${YELLOW}4️⃣  Verifying migrations...${NC}"
MIGRATION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM _schema_version;" 2>/dev/null || echo "0")
if [ "$MIGRATION_COUNT" -eq "3" ]; then
  echo -e "${GREEN}✅ Migrations completed (3/3)${NC}"
else
  echo -e "${RED}❌ Expected 3 migrations, found $MIGRATION_COUNT${NC}"
  exit 1
fi

# Whitelist check
echo -e "\n${YELLOW}5️⃣  Verifying whitelisted emails...${NC}"
EMAIL_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM whitelisted_emails;" 2>/dev/null || echo "0")
if [ "$EMAIL_COUNT" -ge "3" ]; then
  echo -e "${GREEN}✅ Whitelisted emails present ($EMAIL_COUNT)${NC}"
else
  echo -e "${YELLOW}⚠️  Only $EMAIL_COUNT whitelisted emails (expected >= 3)${NC}"
fi

# Auth endpoint
echo -e "\n${YELLOW}6️⃣  Testing /api/auth/me (unauthenticated)...${NC}"
if curl -s http://localhost:5000/api/auth/me | grep -q "Not authenticated"; then
  echo -e "${GREEN}✅ Correctly rejected unauthenticated request${NC}"
else
  echo -e "${RED}❌ Should reject unauthenticated /auth/me${NC}"
  exit 1
fi

# Admin endpoint
echo -e "\n${YELLOW}7️⃣  Testing /api/admin/emails (no auth)...${NC}"
if curl -s http://localhost:5000/api/admin/emails | grep -q "Not authenticated"; then
  echo -e "${GREEN}✅ Correctly rejected admin endpoint without auth${NC}"
else
  echo -e "${RED}❌ Should reject unauthenticated /admin/emails${NC}"
  exit 1
fi

# QB endpoint
echo -e "\n${YELLOW}8️⃣  Testing /api/quickbooks/auth (no auth)...${NC}"
if curl -s http://localhost:5000/api/quickbooks/auth | grep -q "Not authenticated"; then
  echo -e "${GREEN}✅ Correctly rejected QB endpoint without auth${NC}"
else
  echo -e "${RED}❌ Should reject unauthenticated QB endpoint${NC}"
  exit 1
fi

echo -e "\n${GREEN}════════════════════════════════${NC}"
echo -e "${GREEN}✅ All smoke tests passed!${NC}"
echo -e "${GREEN}════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Run full test scenarios: see TEST_SCENARIOS.md"
echo "2. Deploy to production: git push origin main"
echo "3. Verify in Railway: check application logs"
echo ""
