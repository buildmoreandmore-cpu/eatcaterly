# 🧪 Comprehensive Testing Guide

## Quick Start: 3 Essential Tests

### Test 1: Run Unit Tests (2 minutes)
```bash
cd /Users/martinfrancis/sms-food-delivery
npm test -- __tests__/lib/stripe-connect-payments.test.ts
```

**Expected:** 12/12 helper function tests passing ✅

### Test 2: Verify Database Schema (1 minute)
```bash
npx prisma studio
```

**Check Order model has:**
- ✅ `businessId` field
- ✅ `platformFee` field

### Test 3: Create Test Payment Link (5 minutes)

**Step 1: Start server**
```bash
npm run dev
```

**Step 2: Use Stripe CLI to test**
```bash
# Install Stripe CLI first (one-time)
# macOS: brew install stripe/stripe-cli/stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Test webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Detailed Testing Guide

### Phase 1: Local Unit Tests

```bash
# Test all payment routing logic
npm test -- __tests__/lib/stripe-connect-payments.test.ts

# Expected results:
# ✅ calculatePlatformFee - 4/4 tests
# ✅ validateBusinessPaymentReady - 5/5 tests  
# ✅ getBusinessFromOrder - 3/3 tests

# Test rate limiting
npm test -- __tests__/lib/rate-limiting.test.ts

# Test webhooks
npm test -- __tests__/lib/stripe-connect-webhooks.test.ts
```

---

### Phase 2: Manual Payment Flow Test

**Scenario: Test $30 Order with 2% Platform Fee**

**1. Create test business with Stripe Connect**
```bash
curl -X POST http://localhost:3000/api/stripe-connect/create-account \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userId":"test_123"}'
```

**2. Complete Stripe onboarding**
- Open the `onboardingUrl` from response
- Use test data:
  - Tax ID: 000-00-0000
  - Bank: 110000000 (routing) / 000123456789 (account)

**3. Create order and payment link**
```bash
# Create order first (adapt to your API)
# Then create payment link:
curl -X POST http://localhost:3000/api/orders/YOUR_ORDER_ID/payment
```

**4. Verify in response:**
```json
{
  "success": true,
  "data": {
    "paymentLinkId": "plink_test...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

**5. Check Stripe Dashboard**

Go to: https://dashboard.stripe.com/test/connect/accounts

**Verify:**
- ✅ Payment link exists on CONNECTED account (not platform)
- ✅ Application fee: 2% ($0.60 for $30 order)
- ✅ Metadata includes orderId, businessId

**6. Complete test payment**
- Open payment link
- Use card: 4242 4242 4242 4242
- Expiry: 12/25, CVC: 123
- Complete payment

**7. Verify payment distribution**

**Platform Dashboard:**
```
https://dashboard.stripe.com/test/connect/applications/fees
```
✅ Application fee: $0.60
✅ Status: Available

**Connected Account Dashboard:**
✅ Payment: $30.00
✅ Fee deducted: $0.60
✅ Net: $29.40 (minus Stripe fees)

---

### Phase 3: Test Platform Fee Calculation

```bash
# Test different order amounts
# $100 order
echo "100 * 0.02 = 2.00" # Expected: $2.00 fee

# $50 order  
echo "50 * 0.02 = 1.00"  # Expected: $1.00 fee

# $12.34 order
echo "12.34 * 0.02 = 0.25" # Expected: $0.25 fee (rounded)
```

**Verify in database:**
```sql
SELECT id, totalAmount, platformFee 
FROM orders 
WHERE platformFee IS NOT NULL;
```

**Expected:**
- platformFee = totalAmount * 0.02 (in cents)

---

### Phase 4: Test Business Validation

**Test 1: Business without Stripe account**
```bash
# Try to create payment for business without Connect account
curl -X POST http://localhost:3000/api/orders/ORDER_ID/payment
```

**Expected Error:**
```json
{
  "error": "Business has not connected a Stripe account"
}
```

**Test 2: Incomplete onboarding**
```bash
# Try payment before completing onboarding
```

**Expected Error:**
```json
{
  "error": "Business has not completed Stripe onboarding"
}
```

---

### Phase 5: Test Rate Limiting

**Without Upstash (development):**
```bash
# All requests should succeed (rate limiting disabled)
for i in {1..25}; do
  curl http://localhost:3000/api/orders/test/payment
done
```

**With Upstash (production):**

1. Set up Upstash Redis:
   - Go to https://upstash.com
   - Create database
   - Copy REST URL and Token

2. Add to `.env`:
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

3. Test rate limit:
```bash
# Should block after 20 requests
for i in {1..25}; do
  curl http://localhost:3000/api/orders/test/payment \
    -w "\nStatus: %{http_code}\n"
done
```

**Expected:**
- Requests 1-20: Status 200/400/500
- Requests 21-25: **Status 429** (rate limited)

---

### Phase 6: Test Security Headers

```bash
curl -I http://localhost:3000/api/orders/test/payment
```

**Expected Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
```

---

### Phase 7: Test Webhooks

**Using Stripe CLI (Easiest):**

```bash
# 1. Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 2. In another terminal, trigger events
stripe trigger payment_intent.succeeded
stripe trigger application_fee.created
stripe trigger charge.failed
```

**Check console output:**
```
✓ Stripe webhook received: payment_intent.succeeded
✓ Order order_123 updated to PAID
✓ Platform fee collected: $2.00 from account acct_123
```

---

## 🎯 Essential Verification Checklist

### Before Deployment
- [ ] Unit tests pass (12/12)
- [ ] Database schema updated
- [ ] Payment links created on connected account
- [ ] Platform fee calculated correctly (2%)
- [ ] Business validation prevents errors
- [ ] Security headers present

### After Deployment  
- [ ] Create test business in production
- [ ] Complete real Stripe Connect onboarding
- [ ] Make $1 test payment
- [ ] Verify fee in Stripe dashboard: https://dashboard.stripe.com/connect/applications/fees
- [ ] Check business received payment
- [ ] Verify webhook events processed

---

## 🚨 Troubleshooting

### Issue: "Business not found" error
**Fix:** Ensure order has `businessId` set

### Issue: Payment link fails
**Check:**
1. Business has `stripeConnectAccountId`?
2. `stripeOnboardingComplete` = true?
3. `stripeChargesEnabled` = true?

### Issue: No platform fee collected
**Check:**
1. Using `stripeAccount` parameter?
2. `application_fee_amount` set?
3. Looking in correct Stripe dashboard (platform, not connected account)?

### Issue: Rate limiting not working
**Fix:** Set up Upstash Redis environment variables

---

## Quick Command Reference

```bash
# Run tests
npm test

# Start dev server
npm run dev

# Open database viewer
npx prisma studio

# Apply schema changes
npx prisma db push

# Test Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

---

## Expected Results Summary

✅ **Unit Tests:** 12/12 passing
✅ **Payment Flow:** Order → Payment Link → Payment → Webhook → Status Update
✅ **Platform Fee:** 2% automatically collected and deposited to your account
✅ **Business Payment:** Full amount deposited to business account (minus fees)
✅ **Security:** Rate limiting active, headers present, errors sanitized

---

**Testing Time Estimate:**
- Quick tests: 10 minutes
- Complete testing: 30-45 minutes
- Production verification: 15 minutes

**Ready to test?** Start with the Quick Start section at the top!
