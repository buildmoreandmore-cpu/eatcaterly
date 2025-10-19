# Uptime Monitoring Setup Guide

## Health Check Endpoint

✅ **Endpoint**: `/api/health`
✅ **Method**: GET
✅ **Status**: Fully configured and tested

### What It Checks

1. **Database Connectivity** (PostgreSQL via Prisma)
   - Executes `SELECT 1` query
   - Measures response time
   - Returns error if connection fails

2. **Redis Connectivity** (if configured)
   - Pings Redis server
   - Measures response time
   - Returns "not_configured" if Redis env vars missing

3. **Environment Variables**
   - Validates all critical env vars are present
   - Lists missing variables if any

### Response Format

**Healthy Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T02:18:01.185Z",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 217
    },
    "environment": {
      "status": "up"
    },
    "redis": {
      "status": "not_configured"
    }
  },
  "responseTime": 217
}
```

**Unhealthy Response** (503 Service Unavailable):
```json
{
  "status": "unhealthy",
  "timestamp": "2025-10-19T02:20:00.000Z",
  "checks": {
    "database": {
      "status": "down",
      "error": "Connection timeout"
    },
    "environment": {
      "status": "down",
      "missing": ["STRIPE_SECRET_KEY"]
    }
  },
  "responseTime": 5234
}
```

## Recommended Monitoring Services

### Option 1: UptimeRobot (Free Tier)

**Free Plan Includes**:
- 50 monitors
- 5-minute check intervals
- Email/SMS/Slack alerts
- 2 months of logs

**Setup Steps**:

1. Go to https://uptimerobot.com/signUp
2. Create free account
3. Add Monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: EatCaterly Production
   - **URL**: https://sms-food-delivery.vercel.app/api/health
   - **Monitoring Interval**: 5 minutes
   - **Monitor Timeout**: 30 seconds
   - **Monitor HTTP Method**: GET
   - **Expected Status Code**: 200

4. Add Alert Contact:
   - Email: eatcaterly@gmail.com
   - Slack webhook (optional)

5. Save and activate

**Cost**: $0/month

### Option 2: Better Uptime (Recommended)

**Free Plan Includes**:
- Unlimited monitors
- 30-second check intervals
- Status page
- Incident management
- Slack/Discord integration

**Setup Steps**:

1. Go to https://betteruptime.com/
2. Sign up with GitHub
3. Create Monitor:
   - **URL**: https://sms-food-delivery.vercel.app/api/health
   - **Name**: EatCaterly API
   - **Check Frequency**: 1 minute (or 30s on paid)
   - **Expected Status Code**: 200
   - **Timeout**: 30 seconds

4. Add On-Call Schedules:
   - Email: eatcaterly@gmail.com
   - Phone (optional): For critical alerts

5. Create Status Page:
   - URL: status.eatcaterly.com (optional)
   - Public visibility
   - Shows real-time uptime

**Cost**: $0/month (free forever)

### Option 3: Vercel Built-in Monitoring

**Included with Vercel Pro** ($20/month):
- Automatic health checks
- Performance monitoring
- Error tracking
- Uptime alerts

**Setup** (if using Vercel Pro):

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs health check every 5 minutes and alerts on failures.

**Cost**: $20/month (requires Vercel Pro)

### Option 4: Pingdom (Enterprise)

**Starter Plan** ($10/month):
- 10 uptime monitors
- 1-minute check intervals
- Real user monitoring
- Transaction monitoring
- Advanced alerting

**Setup**:

1. Go to https://www.pingdom.com/
2. Create account
3. Add HTTP check:
   - **Name**: EatCaterly Health
   - **URL**: https://sms-food-delivery.vercel.app/api/health
   - **Check Interval**: 1 minute
   - **Alert When**: Response time > 5s OR status code != 200

**Cost**: $10/month

## Recommendation for EatCaterly

**Launch Phase** (first 3 months):
- **Use**: Better Uptime (free)
- **Check Interval**: 1 minute
- **Alerts**: Email + Slack
- **Cost**: $0/month

**Growth Phase** (after 100 customers):
- **Use**: Better Uptime (paid) OR Pingdom
- **Check Interval**: 30 seconds
- **Alerts**: Email + SMS + Slack
- **Cost**: $10-20/month

## Slack Integration (Optional)

Get instant downtime alerts in Slack:

### Better Uptime + Slack

1. In Better Uptime: **Settings** → **Integrations** → **Slack**
2. Click "Add to Slack"
3. Choose channel: `#eatcaterly-alerts`
4. Configure alert types:
   - ✅ Downtime started
   - ✅ Downtime recovered
   - ✅ Performance degradation
   - ⬜ Maintenance mode (optional)

### Sample Alert

```
🚨 EatCaterly API is DOWN
URL: https://sms-food-delivery.vercel.app/api/health
Status: 503 Service Unavailable
Error: Database connection timeout
Duration: 2 minutes
Started: 2:15 PM EST
```

## Dashboard Setup

### Better Uptime Public Status Page

1. Go to **Status Pages** → **Create New**
2. Configure:
   - **URL**: status.eatcaterly.com (or betteruptime subdomain)
   - **Name**: EatCaterly Service Status
   - **Monitors**: Add "EatCaterly API"
   - **Branding**: Upload logo, set colors

3. Add to website footer:
   ```html
   <a href="https://status.eatcaterly.com">Service Status</a>
   ```

### Example Status Page

```
┌──────────────────────────────────────┐
│   EatCaterly Service Status         │
├──────────────────────────────────────┤
│ ✅ All Systems Operational           │
│                                      │
│ EatCaterly API         ✅ Operational│
│ Uptime (30 days):     99.95%        │
│ Response time:        142ms         │
│                                      │
│ Database               ✅ Operational│
│ SMS Service            ✅ Operational│
│ Payment Processing     ✅ Operational│
└──────────────────────────────────────┘
```

## Testing Your Setup

### 1. Test Health Check

```bash
curl https://sms-food-delivery.vercel.app/api/health
```

Expected: 200 OK with healthy status

### 2. Simulate Downtime

Temporarily break database connection in `.env`:
```bash
DATABASE_URL="postgresql://fake:fake@fake:5432/fake"
```

Visit `/api/health` → Should return 503

Restore `.env` and verify 200 OK

### 3. Verify Alerts

In monitoring dashboard:
- Force-trigger test alert
- Confirm email received
- Confirm Slack message (if configured)

## Current Status

✅ **Health Check Endpoint**: Live and tested
✅ **Database Check**: Working (217ms response time)
✅ **Environment Check**: Working (all vars present)
⬜ **Redis Check**: Not configured (optional)
⬜ **Monitoring Service**: Not set up yet

## Next Steps

1. **Choose monitoring service** (recommend: Better Uptime free tier)
2. **Add health check URL** to monitoring service
3. **Configure alerts** (email + Slack)
4. **Test alert delivery** (simulate downtime)
5. **Add status page link** to website footer (optional)

**Estimated setup time**: 10 minutes

---

**The health endpoint is ready** - you just need to connect it to a monitoring service to get alerts when the site goes down.
