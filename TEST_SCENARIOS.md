# Test Scenarios & Validation

This document outlines all test scenarios that must pass before production release.

## Phase 4: Integration Testing & UAT

### 1. Fresh Environment Build

**Objective:** Verify app builds and starts from clean environment

**Steps:**
```bash
# Simulate Railway build environment
rm -rf node_modules dist
npm ci
npm run check  # TypeScript type check
npm run build  # Build client and server
timeout 10s npm start || true  # Start server with timeout
curl -f http://localhost:5000/health
```

**Expected:**
- ✅ `npm ci` completes without errors
- ✅ `npm run check` passes (no TS errors)
- ✅ `npm run build` completes successfully
- ✅ Server starts and responds to `/health`

**Failure Recovery:**
- If build fails: check TypeScript errors, fix, re-run
- If health check fails: check server logs for migration or DB errors

---

### 2. Database Migrations

**Objective:** Verify migrations run automatically on startup

**Prerequisites:**
- Fresh PostgreSQL/Supabase database (or restore from backup)

**Steps:**
```bash
export DATABASE_URL="postgresql://user:pass@host/db"
npm start
```

**Expected:**
- ✅ Server logs show: `Running migration 1: init_schema`
- ✅ Server logs show: `Running migration 2: bootstrap_whitelisted_emails`
- ✅ Server logs show: `Running migration 3: add_qb_auth_state_tracking`
- ✅ Server logs show: `✅ All migrations completed successfully`

**Verify in Database:**
```sql
-- Check migration history
SELECT * FROM _schema_version ORDER BY version;
-- Should have 3 rows

-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname='public';
-- Should include: users, whitelisted_emails, qb_credentials, qb_auth_states, qb_sync_audit_log

-- Check whitelisted emails
SELECT * FROM whitelisted_emails;
-- Should contain: sal@satrianomarine.com, maria@satrianomarine.com, satrianomarine@gmail.com
```

---

### 3. Authentication - Signup Flow

**Objective:** Verify signup validates whitelist and creates user correctly

**Test Case 3a: Valid whitelisted email**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"Test123!"}'
```

**Expected:** 200 with response:
```json
{
  "message": "Signup successful",
  "user": { "id": 1, "email": "sal@satrianomarine.com", "isAdmin": false }
}
```

**Test Case 3b: Non-whitelisted email**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"random@example.com","password":"Test123!"}'
```

**Expected:** 403 with message: "Email not authorized for signup"

**Test Case 3c: Duplicate email**
```bash
# Try signing up again with same email
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"Different!"}'
```

**Expected:** 400 with message: "Email already registered"

**Test Case 3d: Email normalization**
```bash
# Signup with different case
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"SAL@SATRIANOMARINE.COM","password":"Test123!"}'
```

**Expected:** 400 with message: "Email already registered" (same user as 3a)

---

### 4. Authentication - Login Flow

**Objective:** Verify login doesn't mutate privilege, returns correct admin status

**Test Case 4a: Valid credentials**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"Test123!"}' \
  -c cookies.txt
```

**Expected:** 200 with response:
```json
{
  "message": "Login successful",
  "user": { "id": 1, "email": "sal@satrianomarine.com", "isAdmin": false }
}
```

Also verify cookie is set:
```bash
grep "token" cookies.txt
```

**Test Case 4b: Wrong password**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"WrongPassword"}'
```

**Expected:** 401 with message: "Invalid email or password"

**Test Case 4c: Non-existent email**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doesnotexist@example.com","password":"Test123!"}'
```

**Expected:** 401 with message: "Invalid email or password"

**Test Case 4d: Login doesn't grant admin**
```bash
# Verify isAdmin remains false after login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"Test123!"}'
# Check response.user.isAdmin = false
```

---

### 5. Authorization - Admin Access

**Objective:** Verify non-admin users cannot access admin endpoints

**Setup:**
- Login as normal user (from Test 4a) - save cookies.txt
- Manually set an admin user:
  ```sql
  INSERT INTO users (email, password, is_admin) VALUES
  ('admin@test.com', '$2b$10$...', true);  -- Use bcryptjs hash
  ```
- Login as admin, save cookies_admin.txt

**Test Case 5a: Non-admin access to /api/admin/emails**
```bash
curl http://localhost:5000/api/admin/emails -b cookies.txt
```

**Expected:** 403 with message: "Admin access required"

**Test Case 5b: Admin access to /api/admin/emails**
```bash
curl http://localhost:5000/api/admin/emails -b cookies_admin.txt
```

**Expected:** 200 with emails list

**Test Case 5c: Non-admin cannot add email**
```bash
curl -X POST http://localhost:5000/api/admin/emails \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com"}' \
  -b cookies.txt
```

**Expected:** 403 with message: "Admin access required"

**Test Case 5d: Non-auth access denied**
```bash
curl http://localhost:5000/api/admin/emails
```

**Expected:** 403 (no credentials)

---

### 6. Whitelist Management

**Objective:** Verify admin can add/remove whitelisted emails permanently

**Setup:** Login as admin (from Test 5)

**Test Case 6a: Add new whitelisted email**
```bash
curl -X POST http://localhost:5000/api/admin/emails \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@satrianomarine.com"}' \
  -b cookies_admin.txt
```

**Expected:** 200 with email added

**Verify:**
```bash
curl http://localhost:5000/api/admin/emails -b cookies_admin.txt
# Response should include newuser@satrianomarine.com
```

**Test Case 6b: Email normalization on add**
```bash
curl -X POST http://localhost:5000/api/admin/emails \
  -H "Content-Type: application/json" \
  -d '{"email":"  NORMALTEST@SATRIANOMARINE.COM  "}' \
  -b cookies_admin.txt
```

**Expected:** Email stored in lowercase and trimmed

**Test Case 6c: Duplicate email rejection**
```bash
# Try adding email that's already whitelisted
curl -X POST http://localhost:5000/api/admin/emails \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com"}' \
  -b cookies_admin.txt
```

**Expected:** 400 with message: "Email already whitelisted"

**Test Case 6d: Remove whitelisted email**
```bash
curl -X DELETE http://localhost:5000/api/admin/emails/newuser@satrianomarine.com \
  -b cookies_admin.txt
```

**Expected:** 200 with message: "Email removed"

**Verify removed:**
```bash
curl http://localhost:5000/api/admin/emails -b cookies_admin.txt
# Response should NOT include newuser@satrianomarine.com
```

**Test Case 6e: Email persistence**
```bash
# Restart the server
npm start &
sleep 3

# Verify whitelist is still there (not re-bootstrapped)
curl http://localhost:5000/api/admin/emails -b cookies_admin.txt
# Should still have the original 3 + any added emails
```

---

### 7. QuickBooks OAuth Flow

**Objective:** Verify QB auth CSRF protection and state validation

**Setup:** Have QB sandbox credentials in environment variables

**Test Case 7a: Generate auth URL with secure state**
```bash
curl http://localhost:5000/api/quickbooks/auth -b cookies_admin.txt
```

**Expected:** 200 with response:
```json
{
  "authUrl": "https://quickbooks.api.intuit.com/v2/oauth2/tokens/oauth?...",
  "state": "a1b2c3d4e5f6..." (64 hex chars)
}
```

**Verify state is stored in database:**
```sql
SELECT * FROM qb_auth_states WHERE state = 'a1b2c3d4e5f6...';
-- Should have created_at and expires_at (10 min from now)
```

**Test Case 7b: Non-admin cannot generate auth URL**
```bash
curl http://localhost:5000/api/quickbooks/auth -b cookies.txt
```

**Expected:** 403 with message: "Admin access required"

**Test Case 7c: Callback with invalid state**
```bash
curl "http://localhost:5000/api/quickbooks/callback?code=dummy&state=invalid_state"
```

**Expected:** 403 with message: "Invalid or expired state parameter"

**Test Case 7d: Callback with expired state**
```bash
# Wait 11 minutes, then try to use state from 7a
sleep 660
curl "http://localhost:5000/api/quickbooks/callback?code=dummy&state=a1b2c3d4e5f6..."
```

**Expected:** 403 with message: "Invalid or expired state parameter"

**Test Case 7e: Valid flow (with real QB credentials)**
```bash
# This requires real QuickBooks OAuth flow
# 1. Get auth URL from 7a
# 2. Manually authorize at QB (or use sandbox test account)
# 3. QB redirects with code + state
# 4. Verify callback succeeds
```

**Expected:** 200 with message: "QuickBooks connected successfully"

**Verify credentials saved:**
```sql
SELECT realm_id, access_token, refresh_token FROM qb_credentials LIMIT 1;
-- Should have values populated
```

---

### 8. QuickBooks Sync Audit Logging

**Objective:** Verify sync operations are logged for audit trail

**Setup:** QB credentials already saved (from Test 7e)

**Test Case 8a: Sync operation logging**
```bash
curl -X POST http://localhost:5000/api/quickbooks/sync -b cookies_admin.txt
```

**Expected:** 200 with message about number of estimates imported

**Verify audit log:**
```sql
SELECT * FROM qb_sync_audit_log ORDER BY started_at DESC LIMIT 1;
-- Should have: started_at, completed_at, estimates_imported, status='success'
```

**Test Case 8b: Sync with no credentials**
```bash
# Delete QB credentials
DELETE FROM qb_credentials;

curl -X POST http://localhost:5000/api/quickbooks/sync -b cookies_admin.txt
```

**Expected:** 400 with message: "QB not connected"

**Verify failed sync logged:**
```sql
SELECT * FROM qb_sync_audit_log ORDER BY started_at DESC LIMIT 1;
-- Should have: status='failed', error_message='QB not connected'
```

**Test Case 8c: Non-admin cannot sync**
```bash
curl -X POST http://localhost:5000/api/quickbooks/sync -b cookies.txt
```

**Expected:** 403 with message: "Admin access required"

---

### 9. Session Management

**Objective:** Verify JWT tokens expire and require re-login

**Test Case 9a: Token in cookie persists across requests**
```bash
# Login and save cookie
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"Test123!"}' \
  -c cookies.txt

# Use same cookie for multiple requests
curl http://localhost:5000/api/auth/me -b cookies.txt
curl http://localhost:5000/api/auth/me -b cookies.txt
```

**Expected:** 200 for both /auth/me requests

**Test Case 9b: Logout clears cookie**
```bash
curl -X POST http://localhost:5000/api/auth/logout -b cookies.txt

# Try using cleared cookie
curl http://localhost:5000/api/auth/me -b cookies.txt
```

**Expected:** 401 with message: "Not authenticated"

**Test Case 9c: Invalid/malformed token rejected**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Cookie: token=invalid.jwt.token"
```

**Expected:** 401 with message: "Not authenticated"

---

### 10. End-to-End Workflow

**Objective:** Verify complete app workflow works together

**Scenario: New dispatcher added, accesses board**

1. Admin adds dispatcher email to whitelist
   ```bash
   curl -X POST http://localhost:5000/api/admin/emails \
     -H "Content-Type: application/json" \
     -d '{"email":"dispatcher@satrianomarine.com"}' \
     -b cookies_admin.txt
   ```

2. Dispatcher signs up
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"dispatcher@satrianomarine.com","password":"Safe123!"}' \
     -c dispatcher_cookies.txt
   ```

3. Dispatcher logs in
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"dispatcher@satrianomarine.com","password":"Safe123!"}' \
     -b dispatcher_cookies.txt
   ```

4. Verify dispatcher access (not admin)
   ```bash
   curl http://localhost:5000/api/admin/emails -b dispatcher_cookies.txt
   # Should get 403
   ```

5. Verify dispatcher can access regular endpoints
   ```bash
   curl http://localhost:5000/api/auth/me -b dispatcher_cookies.txt
   # Should get user info with isAdmin=false
   ```

**Expected:** All steps succeed with appropriate access control

---

## Smoke Test Checklist

Before declaring "ready for production", verify:

- [ ] Fresh build succeeds (Phase 1)
- [ ] Migrations run automatically (Phase 2)
- [ ] Signup whitelist validation works (Phase 3)
- [ ] Login doesn't grant admin (Phase 4)
- [ ] Admin middleware enforces access (Phase 5)
- [ ] Whitelist add/remove is permanent (Phase 6)
- [ ] QB CSRF state is validated (Phase 7)
- [ ] Sync operations are audited (Phase 8)
- [ ] Session cookies work correctly (Phase 9)
- [ ] End-to-end workflow works (Phase 10)

## Running Tests Automatically

For future CI/CD:

```bash
#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Starting server..."
npm start &
SERVER_PID=$!
sleep 2

echo "Running smoke tests..."
curl -f http://localhost:5000/health
curl -f http://localhost:5000/api/auth/me && echo "Should fail" && exit 1 || echo "Correctly rejected"

kill $SERVER_PID
echo "✅ All smoke tests passed"
```

## Sign-Off

When all test scenarios pass, confirm:

```
[ ] Tested fresh build
[ ] Tested migrations
[ ] Tested auth flows
[ ] Tested admin access
[ ] Tested QB integration
[ ] Tested audit logging
[ ] Ready for production
```
