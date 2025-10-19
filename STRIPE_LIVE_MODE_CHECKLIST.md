# Stripe Live Mode Deployment Checklist

## ⚠️ CRITICAL: Your app currently has TEST mode keys

**Current Status**:
- ❌ Using `sk_test_...` (TEST mode)
- ❌ Using `pk_test_...` (TEST mode)

**Required**: Switch to LIVE mode keys before accepting real payments

---

## 📋 Step-by-Step Checklist

### ✅ Step 1: Get Live Mode API Keys (5 minutes)

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. **Switch to Live Mode** (toggle in top-right corner)
3. Go to **Developers** → **API Keys**
4. Copy both keys:
   ```
   Secret key: sk_live_XXXXXXXXXXXXXXXXXXXXX
   Publishable key: pk_live_XXXXXXXXXXXXXXXXXXXXX
   ```

**Do NOT share these keys publicly or commit them to git!**

---

### ✅ Step 2: Create Live Mode Products & Prices (10 minutes)

Your subscription tiers need to exist in **live mode**:

1. In Stripe Dashboard (Live Mode) → **Products**
2. Create **Starter Plan**:
   - Name: "Starter Plan"
   - Price: $29/month (or your pricing)
   - Click Save → **Copy the Price ID** (starts with `price_`)
3. Create **Pro Plan**:
   - Name: "Pro Plan"
   - Price: $99/month (or your pricing)
   - Click Save → **Copy the Price ID**

**Save these for Step 4!**

---

### ✅ Step 3: Configure Live Mode Webhook (15 minutes)

**This is CRITICAL - payments won't work without it!**

1. In Stripe Dashboard (Live Mode) → **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL**:
   ```
   https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe
   ```
   Replace `YOUR-DOMAIN` with your actual Vercel domain

4. **Events to send**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `account.updated` (for Stripe Connect if using)

5. Click **Add endpoint**
6. **IMPORTANT**: Copy the **Signing secret** (starts with `whsec_`)

---

### ✅ Step 4: Update Vercel Environment Variables (5 minutes)

In [Vercel Dashboard](https://vercel.com) → Your Project → **Settings** → **Environment Variables**:

**Update these variables** (or add if missing):

```bash
# Stripe Live Mode Keys
STRIPE_SECRET_KEY="sk_live_YOUR_ACTUAL_LIVE_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY"

# Webhook Secret (from Step 3)
STRIPE_WEBHOOK_SECRET="whsec_YOUR_LIVE_WEBHOOK_SIGNING_SECRET"

# Live Mode Price IDs (from Step 2)
STRIPE_PRICE_ID_STARTER="price_YOUR_LIVE_STARTER_PRICE_ID"
STRIPE_PRICE_ID_PRO="price_YOUR_LIVE_PRO_PRICE_ID"
```

**Make sure to select "Production" environment** when adding these!

---

### ✅ Step 5: Update Local .env for Testing (2 minutes)

Update your local `.env` file (for local testing only):

```bash
# Stripe Live Mode (for local testing)
STRIPE_SECRET_KEY="sk_live_YOUR_ACTUAL_LIVE_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY"

# Webhook Secret (for local webhook testing)
STRIPE_WEBHOOK_SECRET="whsec_YOUR_LIVE_WEBHOOK_SIGNING_SECRET"

# Price IDs
STRIPE_PRICE_ID_STARTER="price_YOUR_LIVE_STARTER_PRICE_ID"
STRIPE_PRICE_ID_PRO="price_YOUR_LIVE_PRO_PRICE_ID"
```

**Never commit this .env file to git!**

---

### ✅ Step 6: Redeploy to Vercel (2 minutes)

After updating environment variables in Vercel:

```bash
# Option 1: Trigger redeploy via git push
git add .
git commit -m "Ready for Stripe live mode"
git push origin main

# Option 2: Manual redeploy in Vercel dashboard
# Go to Deployments → Click "..." → Redeploy
```

---

### ✅ Step 7: Test Live Mode (10 minutes)

**Test with REAL payment (you'll be charged, but you can refund immediately)**:

1. Visit your production site
2. Try to subscribe to a plan
3. Use a **real credit card** (test cards won't work in live mode)
4. Complete payment
5. Check Stripe Dashboard → Payments (should see the payment)
6. **Immediately refund** in Stripe Dashboard if this was just a test

**Alternative**: Use Stripe's [live mode test card](https://stripe.com/docs/testing) if available

---

### ✅ Step 8: Verify Webhook is Working (5 minutes)

1. Go to Stripe Dashboard (Live Mode) → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Look for recent events (should see events from your test payment)
4. If you see "Succeeded" status, webhooks are working ✅
5. If you see "Failed", check:
   - Webhook URL is correct
   - `STRIPE_WEBHOOK_SECRET` is set in Vercel
   - Your app is deployed and live

---

### ✅ Step 9: Monitor First Real Transactions (ongoing)

After going live:

1. **Check Sentry** for any payment-related errors (if configured)
2. **Check Stripe Dashboard** → Events log for webhook delivery
3. **Check your database** to confirm subscriptions are being created
4. **Monitor Vercel logs** for any payment processing errors

---

## 🔒 Security Checklist

Before going live, verify:

- [ ] Live Stripe keys are ONLY in Vercel (not in git)
- [ ] Webhook endpoint uses signature verification
- [ ] Payment routes have authentication/authorization
- [ ] Environment validation is working (`npm run build` passes)
- [ ] Health check endpoint is live (`/api/health`)
- [ ] SMS broadcast endpoint is secured (tested earlier)

---

## 🚨 Common Issues & Solutions

### Issue: "No such price: price_test_..."

**Cause**: You're using test mode price IDs in live mode

**Fix**: Create new products/prices in live mode (Step 2)

### Issue: Webhook signature verification failed

**Cause**: Using test mode webhook secret with live mode events

**Fix**: Get new webhook signing secret from live mode (Step 3)

### Issue: Payments work but subscriptions don't create in database

**Cause**: Webhook not configured or failing

**Fix**: Check Stripe webhook logs and Vercel function logs

### Issue: "Invalid API Key provided"

**Cause**: Still using test key, or live key not set in Vercel

**Fix**: Update `STRIPE_SECRET_KEY` in Vercel environment variables

---

## 📊 Current Status Tracking

Use this to track your progress:

- [ ] **Step 1**: Got live API keys
- [ ] **Step 2**: Created live products/prices
- [ ] **Step 3**: Configured live webhook
- [ ] **Step 4**: Updated Vercel env vars
- [ ] **Step 5**: Updated local .env
- [ ] **Step 6**: Redeployed to Vercel
- [ ] **Step 7**: Tested live payment
- [ ] **Step 8**: Verified webhook delivery
- [ ] **Step 9**: Monitoring live transactions

---

## 🎯 After Live Mode is Active

### Enable Stripe Radar (Fraud Protection)

1. Stripe Dashboard → **Radar** → **Rules**
2. Review and enable recommended fraud rules
3. Set up notifications for suspicious activity

### Set Up Stripe Billing

1. Enable automatic emails for:
   - Payment receipts
   - Failed payments
   - Subscription renewals
2. Customize email templates with your branding

### Monitor Metrics

Daily checks:
- Successful payment rate
- Failed payment rate
- Webhook delivery success rate
- Average transaction amount

---

## 🆘 Need Help?

- **Stripe Support**: https://support.stripe.com
- **Webhook Testing**: Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- **Check Logs**: Vercel Dashboard → Functions → `/api/webhooks/stripe`

---

**Last Updated**: 2025-10-19
**Status**: Ready to switch to live mode
**Estimated Setup Time**: 45 minutes
