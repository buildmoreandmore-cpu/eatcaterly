# Sentry Error Tracking Setup Guide

## Overview

Sentry is now fully configured for the EatCaterly platform. This guide explains how to enable it for production monitoring.

## What's Already Done

✅ **Installed**: `@sentry/nextjs` package
✅ **Configured**: Client, server, and edge runtime instrumentation
✅ **Integrated**: Next.js webpack plugin for source map uploads
✅ **Protected**: Sensitive data filtering (auth headers, DB connection strings)
✅ **Optimized**: Session replay, error tracking, performance monitoring

## Configuration Files Created

```
sentry.client.config.ts     # Browser error tracking
sentry.server.config.ts     # Server-side error tracking
sentry.edge.config.ts       # Middleware/edge function errors
instrumentation.ts          # Server initialization hook
next.config.ts              # Webpack integration (updated)
.sentryclirc                # CLI configuration
```

## How to Enable Sentry in Production

### Step 1: Create a Sentry Account

1. Go to https://sentry.io/signup/
2. Create a free account (or use existing)
3. Create a new organization named `eatcaterly` (if you haven't already)

### Step 2: Create a Project

1. In Sentry dashboard, click "Create Project"
2. Select platform: **Next.js**
3. Set project name: `sms-food-delivery`
4. Choose your alert settings
5. Click "Create Project"

### Step 3: Get Your DSN

After creating the project:

1. Go to **Settings** → **Projects** → **sms-food-delivery**
2. Click **Client Keys (DSN)**
3. Copy the **DSN** (looks like: `https://abc123@o123456.ingest.sentry.io/7890123`)

### Step 4: Update Environment Variables

Add to your `.env` file:

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://your-actual-dsn@sentry.io/your-project-id"
```

For **production** (Vercel), also add:

```bash
SENTRY_AUTH_TOKEN="your-auth-token-here"
```

### Step 5: Generate an Auth Token (for Source Maps)

Source maps allow Sentry to show you the exact line of code where errors occur.

1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click **"Create New Token"**
3. Set scopes:
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
4. Copy the token
5. Add to Vercel environment variables as `SENTRY_AUTH_TOKEN`

### Step 6: Deploy to Vercel

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_SENTRY_DSN` (your DSN)
   - `SENTRY_AUTH_TOKEN` (your auth token)
3. Redeploy your app

## Features Enabled

### 1. Error Tracking
- All unhandled errors are automatically reported
- Stack traces with source maps
- User context (if authenticated)
- Environment info (dev/prod)

### 2. Performance Monitoring
- 10% of production transactions sampled
- 100% of dev transactions sampled
- API endpoint performance
- Page load performance

### 3. Session Replay
- 10% of normal sessions recorded
- 100% of sessions with errors recorded
- Privacy: All text and media masked by default

### 4. Sensitive Data Filtering
- Authorization headers removed
- Cookies removed
- Database connection strings masked
- Only errors with valid DSN are sent

## Testing Sentry

### Test in Development

1. Create a test API route that throws an error:

```typescript
// src/app/api/test-sentry/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('Test Sentry error - this should appear in Sentry dashboard')
  return NextResponse.json({ ok: true })
}
```

2. Visit http://localhost:3000/api/test-sentry
3. Check your Sentry dashboard for the error

### Test in Production

After deploying:

1. Visit https://yourdomain.com/api/test-sentry
2. Check Sentry dashboard
3. Verify error includes:
   - Full stack trace
   - Environment: production
   - Release version
   - Source maps (exact line number)

## Sentry Dashboard Features

### Issues Tab
- All errors grouped by type
- Frequency and user impact
- Stack traces with source maps
- Breadcrumbs (what happened before the error)

### Performance Tab
- Slowest API endpoints
- Page load times
- Database query performance
- External API call durations

### Releases Tab
- Track errors by deployment
- Compare error rates between releases
- Roll back problematic releases

### Alerts
Configure alerts for:
- New error types
- Error spike detection
- Performance degradation
- Custom metric thresholds

## Cost Estimates

**Free Tier** (good for launch):
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month

**Team Plan** ($26/month):
- 50,000 errors/month
- 100,000 transactions/month
- 500 replays/month

For EatCaterly's expected traffic (100-500 users), **free tier is sufficient for first 3-6 months**.

## Integration with Vercel

Sentry automatically integrates with Vercel:

1. **Vercel Cron Monitoring**: Enabled via `automaticVercelMonitors: true`
2. **Source Maps**: Auto-uploaded during Vercel builds
3. **Environment Detection**: Automatically detects prod/preview/dev
4. **Git Integration**: Links errors to commits and PRs

## Slack Integration (Optional)

Get instant notifications:

1. In Sentry: **Settings** → **Integrations** → **Slack**
2. Click "Add to Slack"
3. Configure alerts:
   - New issues
   - Issue spikes
   - Deploy notifications
4. Choose channel (e.g., `#eatcaterly-alerts`)

## Current Status

**Status**: ✅ Fully configured, ready to enable
**Blocking**: Requires Sentry DSN in environment variables
**Impact**: Once enabled, all production errors will be visible in real-time

## Next Steps

1. Create Sentry account/project (5 minutes)
2. Add DSN to Vercel environment variables (2 minutes)
3. Add auth token for source maps (3 minutes)
4. Redeploy to Vercel (auto-triggered)
5. Test with intentional error (1 minute)

**Total setup time**: ~15 minutes

---

**Sentry is optional but highly recommended** - the app will work fine without it, but you won't have visibility into production errors until users report them.
