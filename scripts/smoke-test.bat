@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 DockOps Smoke Tests
echo ==========================

REM Check environment
if not defined DATABASE_URL (
  echo ❌ DATABASE_URL not set
  exit /b 1
)

if not defined JWT_SECRET (
  echo ⚠️  JWT_SECRET not set, using default
  set JWT_SECRET=test-secret-key
)

REM Build
echo.
echo 1️⃣  Building...
call npm run build > nul 2>&1
if !errorlevel! equ 0 (
  echo ✅ Build succeeded
) else (
  echo ❌ Build failed
  exit /b 1
)

REM Start server
echo.
echo 2️⃣  Starting server...
start "" npm start
timeout /t 3 /nobreak > nul

REM Health check
echo.
echo 3️⃣  Health check...
curl -f http://localhost:5000/health > nul 2>&1
if !errorlevel! equ 0 (
  echo ✅ Server responding
) else (
  echo ❌ Server not responding
  taskkill /im node.exe /f > nul 2>&1
  exit /b 1
)

REM Auth endpoint test
echo.
echo 4️⃣  Testing /api/auth/me (unauthenticated)...
curl -s http://localhost:5000/api/auth/me | findstr "Not authenticated" > nul
if !errorlevel! equ 0 (
  echo ✅ Correctly rejected unauthenticated request
) else (
  echo ❌ Should reject unauthenticated /auth/me
  taskkill /im node.exe /f > nul 2>&1
  exit /b 1
)

REM Admin endpoint test
echo.
echo 5️⃣  Testing /api/admin/emails (no auth)...
curl -s http://localhost:5000/api/admin/emails | findstr "Not authenticated" > nul
if !errorlevel! equ 0 (
  echo ✅ Correctly rejected admin endpoint without auth
) else (
  echo ❌ Should reject unauthenticated /admin/emails
  taskkill /im node.exe /f > nul 2>&1
  exit /b 1
)

REM QB endpoint test
echo.
echo 6️⃣  Testing /api/quickbooks/auth (no auth)...
curl -s http://localhost:5000/api/quickbooks/auth | findstr "Not authenticated" > nul
if !errorlevel! equ 0 (
  echo ✅ Correctly rejected QB endpoint without auth
) else (
  echo ❌ Should reject unauthenticated QB endpoint
  taskkill /im node.exe /f > nul 2>&1
  exit /b 1
)

REM Cleanup
taskkill /im node.exe /f > nul 2>&1

echo.
echo ════════════════════════════════
echo ✅ All smoke tests passed!
echo ════════════════════════════════
echo.
echo Next steps:
echo 1. Run full test scenarios: see TEST_SCENARIOS.md
echo 2. Deploy to production: git push origin main
echo 3. Verify in Railway: check application logs
echo.

endlocal
