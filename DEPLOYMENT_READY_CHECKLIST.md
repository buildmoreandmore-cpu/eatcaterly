# EatCaterly - Final Deployment Checklist

## ✅ COMPLETED

- [x] Live Stripe API Keys configured
- [x] Live Stripe Price IDs set
  - Starter: `price_1SJmiDCRN5WcWdZHEOUApKb8`
  - Pro: `price_1SJmigCRN5WcWdZH2hWlVZDQ`
- [x] Security fixes deployed (SMS broadcast, env validation)
- [x] Health check endpoint live
- [x] Sentry integration ready
- [x] GitHub Actions CI/CD configured
- [x] Database connected (Supabase)
- [x] EZTexting SMS configured
- [x] Build passing

---

## 🔴 CRITICAL - Do Before First Deploy

### 1. Configure Stripe Webhook (15 minutes)

**This is REQUIRED for payments to work!**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) (Live Mode)
2. **Developers** → **Webhooks** → **Add endpoint**
3. Endpoint URL: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/webhooks/stripe`
   - Replace with your actual Vercel domain (e.g., `sms-food-delivery.vercel.app`)
4. **Select events to send**:
   ```
   ✓ payment_intent.succeeded
   ✓ payment_intent.payment_failed
   ✓ checkout.session.completed
   ✓ customer.subscription.created
   ✓ customer.subscription.updated
   ✓ customer.subscription.deleted
   ✓ invoice.payment_succeeded
   ✓ invoice.payment_failed
   ```
5. Click **Add endpoint**
6. **COPY THE SIGNING SECRET** (starts with `whsec_`)
   - You'll need this for Step 2!

---

### 2. Add Environment Variables to Vercel (10 minutes)

Go to [Vercel Dashboard](https://vercel.com) → Your Project → **Settings** → **Environment Variables**

**Add ALL of these** (select "Production" environment):

```bash
# Database (copy from local .env)
DATABASE_URL="postgresql://postgres.xsyjqtcxxeeyylzyswcl:0ah8qTU7gVdUZz2j@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xsyjqtcxxeeyylzyswcl:0ah8qTU7gVdUZz2j@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# Clerk Authentication (copy from local .env)
CLERK_SECRET_KEY="sk_test_Ka246EBhOoFo4sH0jMiBvT5CsEpwatf4Bx5Aqq6Y0g"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_d29ya2luZy1kb3ZlLTk4LmNsZXJrLmFjY291bnRzLmRldiQ"

# Stripe - LIVE MODE (your new live keys)
STRIPE_SECRET_KEY="sk_live_YOUR_ACTUAL_LIVE_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY"

# Stripe Webhook (from Step 1 above)
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SIGNING_SECRET_FROM_STEP_1"

# Stripe Price IDs - LIVE MODE
STRIPE_PRICE_ID_STARTER="price_1SJmiDCRN5WcWdZHEOUApKb8"
STRIPE_PRICE_ID_PRO="price_1SJmigCRN5WcWdZH2hWlVZDQ"

# EZTexting SMS (copy from local .env)
EZTEXTING_USERNAME="mfessbar@gmail.com"
EZTEXTING_PASSWORD="JamalWatson1990$"
EZ_TEXTING_API_KEY="35116897-85ab-4865-9973-69610577f1b6"
EZ_TEXTING_API_URL="https://api.eztexting.com/v2"

# Production URLs - REPLACE WITH YOUR ACTUAL VERCEL DOMAIN
NEXT_PUBLIC_APP_URL="https://YOUR-VERCEL-DOMAIN.vercel.app"
APP_URL="https://YOUR-VERCEL-DOMAIN.vercel.app"

# Sentry (Optional - add later if desired)
# NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/your-project-id"
# SENTRY_AUTH_TOKEN="your-auth-token"
```

**IMPORTANT**: Click "Add" for EACH variable separately!

---

### 3. Deploy to Vercel (5 minutes)

**Option A: Via Git (Recommended)**
```bash
# Commit your changes
git add .
git commit -m "Production ready: Live Stripe keys configured"
git push origin main
```

Vercel will automatically deploy when you push to main.

**Option B: Manual Deploy**
1. Go to Vercel Dashboard → Deployments
2. Click "..." → **Redeploy**

---

### 4. Verify Deployment (5 minutes)

After deployment completes:

**A. Check Health Endpoint**
```bash
curl https://YOUR-VERCEL-DOMAIN.vercel.app/api/health
```
Should return:
```json
{"status":"healthy","checks":{"database":{"status":"up"},...}}
```

**B. Verify SMS Broadcast Security**
```bash
curl -X POST https://YOUR-VERCEL-DOMAIN.vercel.app/api/sms/broadcast
```
Should return:
```json
{"error":"Unauthorized. Please sign in."}
```
✅ If you get this, security is working!

**C. Check Environment Validation**
- If build fails with env var errors, go back to Step 2
- Check Vercel Function logs for specific missing variables

---

### 5. Test Live Payment (10 minutes)

**Test with a REAL payment** (you can refund immediately):

1. Visit your production site: `https://YOUR-VERCEL-DOMAIN.vercel.app`
2. Sign up for an account
3. Try to subscribe to a plan
4. Use a **real credit card** (test cards won't work in live mode)
5. Complete the payment
6. **Check Stripe Dashboard**:
   - Go to **Payments** → Should see your payment ✅
   - Go to **Customers** → Should see the subscription ✅
7. **Check Webhooks**:
   - Go to **Developers** → **Webhooks** → Your endpoint
   - Should see "Succeeded" events ✅
8. **Refund the test payment** (if you want):
   - Stripe Dashboard → Payments → Click payment → Refund

---

## ⚠️ OPTIONAL - Recommended Post-Deploy

### Switch Clerk to Production Keys (Optional)

If you want to use production Clerk keys instead of test:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Switch to **Production** (if not already)
3. **API Keys** → Copy live keys
4. Update in Vercel:
   ```bash
   CLERK_SECRET_KEY="sk_live_YOUR_PRODUCTION_CLERK_SECRET_KEY"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_YOUR_PRODUCTION_CLERK_PUBLISHABLE_KEY"
   ```
5. Redeploy

**Note**: Test keys work fine for production, but live keys are recommended for better analytics.

---

### Enable Sentry Error Tracking (Recommended)

1. Create account at [sentry.io](https://sentry.io)
2. Create project: **Next.js**
3. Name: `sms-food-delivery`
4. Copy DSN
5. Add to Vercel:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/your-project-id"
   ```
6. Generate auth token (for source maps)
7. Add to Vercel:
   ```bash
   SENTRY_AUTH_TOKEN="your-auth-token"
   ```
8. Redeploy

**Benefits**: Real-time error alerts, user session replay, performance monitoring

See: `SENTRY_SETUP_GUIDE.md` for full instructions

---

### Set Up Uptime Monitoring (Recommended)

**Option 1: Better Uptime (Free)**
1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Create monitor for: `https://YOUR-DOMAIN.vercel.app/api/health`
3. Check interval: 1 minute
4. Add email alerts

**Option 2: UptimeRobot (Free)**
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add HTTP(s) monitor
3. URL: `https://YOUR-DOMAIN.vercel.app/api/health`
4. Check interval: 5 minutes

See: `UPTIME_MONITORING_SETUP.md` for full instructions

---

### Enable GitHub Actions CI/CD (Recommended)

1. Add secrets to GitHub:
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Add all environment variables from Step 2
2. Push the workflow:
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```
3. Enable branch protection:
   - GitHub → Settings → Branches
   - Require status checks to pass before merging

See: `GITHUB_ACTIONS_SETUP.md` for full instructions

---

## 🎯 Quick Reference

### Your Vercel Domain
```
https://YOUR-VERCEL-DOMAIN.vercel.app
```
(Check Vercel Dashboard → Settings → Domains)

### Your Webhook URL (for Stripe)
```
https://YOUR-VERCEL-DOMAIN.vercel.app/api/webhooks/stripe
```

### Your Health Check URL (for monitoring)
```
https://YOUR-VERCEL-DOMAIN.vercel.app/api/health
```

---

## 🚨 Troubleshooting

### "No such price" error
**Cause**: Using test price IDs with live keys (or vice versa)
**Fix**: Make sure BOTH keys and price IDs are from live mode

### Webhook signature verification failed
**Cause**: Wrong webhook secret or test/live mismatch
**Fix**: Get new webhook secret from LIVE mode Stripe dashboard

### Payments don't create subscriptions
**Cause**: Webhook not configured or failing
**Fix**: Check Stripe webhook logs and Vercel function logs

### Build fails with env var error
**Cause**: Missing required environment variable in Vercel
**Fix**: Check which variable is missing and add it in Vercel

---

## ✅ Deployment Complete Checklist

- [ ] Stripe webhook configured (Step 1)
- [ ] All env vars added to Vercel (Step 2)
- [ ] Deployed to Vercel (Step 3)
- [ ] Health check verified (Step 4A)
- [ ] SMS security verified (Step 4B)
- [ ] Test payment successful (Step 5)
- [ ] Webhook events showing "Succeeded" (Step 5)
- [ ] Sentry configured (Optional)
- [ ] Uptime monitoring enabled (Optional)
- [ ] GitHub Actions enabled (Optional)

---

## 🎉 You're Live!

After completing the critical steps above, your EatCaterly platform is **LIVE and accepting real payments**!

**Next Steps**:
- Monitor Stripe dashboard for payments
- Check Sentry for any errors (if enabled)
- Monitor uptime (if enabled)
- Add your first real customer!

---

**Last Updated**: 2025-10-19
**Status**: Ready for final deployment
**Time to Complete**: ~45 minutes
