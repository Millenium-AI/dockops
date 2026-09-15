# DockOps Deployment Guide

## Pre-Deployment Checklist

### Environment Variables (Railway)

Ensure the following are set in Railway:

```
DATABASE_URL=postgresql://user:pass@host/database
JWT_SECRET=your-random-secret-key
QB_CLIENT_ID=your-qb-client-id
QB_CLIENT_SECRET=your-qb-client-secret
QB_REDIRECT_URI=https://board.satrianomarine.com/api/quickbooks/callback
NODE_ENV=production
```

### Database State

Before deploying:

1. **Backup production database**
   ```bash
   # In Supabase dashboard: take a manual backup
   # Or via CLI: pg_dump postgresql://... > backup.sql
   ```

2. **Verify whitelisted emails are in database**
   ```sql
   SELECT * FROM whitelisted_emails;
   -- Should contain: sal@satrianomarine.com, maria@satrianomarine.com, satrianomarine@gmail.com
   ```

3. **Check admin user status**
   ```sql
   SELECT email, is_admin FROM users WHERE is_admin = true;
   ```

## Deployment Steps (Railway)

### Fresh Deployment

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **Railway automatically:**
   - Runs `npm ci` (clean install)
   - Runs `npm run build` (TypeScript + bundle)
   - Starts with `npm start`

3. **Verify deployment**
   - Check Railway logs for migration output
   - Logs should show: `✅ All migrations completed successfully`

### Smoke Tests (After Deploy)

```bash
# 1. Health check (no auth required)
curl https://board.satrianomarine.com/health

# Expected response:
# {"status":"ok","timestamp":"2026-09-15T..."}

# 2. Signup flow (with valid whitelisted email)
curl -X POST https://board.satrianomarine.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"test123"}'

# Expected: 400 if user exists, or 200 with user object

# 3. Login flow
curl -X POST https://board.satrianomarine.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sal@satrianomarine.com","password":"test123"}' \
  -c cookies.txt

# Expected: 200 with cookie set

# 4. Verify admin access
curl https://board.satrianomarine.com/api/admin/emails \
  -b cookies.txt

# Expected: 403 if user is not admin, 200 with emails list if admin
```

## Database Migrations

### How Migrations Work

1. Migrations run automatically on app startup via `ensureAdminSetup()`
2. Migration state is tracked in `_schema_version` table
3. Only new migrations (version > current) are executed
4. Failed migrations will cause the app to crash (fail-fast)

### Viewing Migration History

```sql
SELECT version, name, applied_at FROM _schema_version ORDER BY version DESC;
```

### Adding New Migrations

1. Edit `server/migrations.ts`
2. Add new migration object to `migrations` array
3. Increment `version` number
4. Test locally with `npm run dev`
5. Deploy - migration runs automatically

Example:

```typescript
{
  version: 4,
  name: "add_user_column",
  up: async (sql) => {
    await sql`ALTER TABLE users ADD COLUMN phone_number TEXT`;
  },
}
```

## Rollback Procedures

### Database Rollback (if needed)

1. **Stop the service** in Railway
2. **Restore from backup** in Supabase dashboard
3. **Fix the code** locally
4. **Redeploy**

### Reverting a Commit

If a deployment introduced bugs:

```bash
# Find the commit to revert
git log --oneline

# Revert (creates new commit)
git revert <commit-hash>

# Push to main
git push origin main

# Railway redeploys automatically
```

## Troubleshooting

### Migrations Failed

**Symptom:** App crashes on startup with migration error

**Solution:**
1. Check Railway logs for error details
2. Restore database from backup
3. Fix the migration in code
4. Redeploy

### "DATABASE_URL not found"

**Symptom:** App crashes immediately

**Solution:**
1. Check Railway environment variables
2. Ensure DATABASE_URL is set correctly
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`
4. Redeploy

### Admin Lost Access

**Symptom:** Admin can't login or access /admin endpoints

**Solution:**
1. Check database: `SELECT email, is_admin FROM users WHERE email = '...'`
2. If `is_admin = false`, manually update:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
   ```
3. User must log out and log back in for JWT to refresh

### QB Auth State Expired

**Symptom:** "Invalid or expired state parameter" error

**Solution:**
- This is expected if QB auth flow takes > 10 minutes
- Admin should restart the QB authorization flow
- States are auto-cleaned by PostgreSQL (keep only recent ones)

## Security Notes

1. **Never commit secrets** - use Railway environment variables only
2. **JWT tokens expire in 7 days** - users must re-login after that
3. **QB tokens expire** - monitored in `qb_credentials.expires_at`
4. **Admin flag only changes via DB updates** - never set by login/signup flow
5. **State parameter prevents CSRF** - validated on every QB callback

## Performance Monitoring

Check Railway metrics for:
- Request latency (should be < 200ms for most endpoints)
- Database connection pool usage
- Error rates

## Contact & Support

For deployment issues:
1. Check Railway logs first
2. Verify DATABASE_URL and other env vars
3. Check git log to see what changed
4. Restore from backup if needed
