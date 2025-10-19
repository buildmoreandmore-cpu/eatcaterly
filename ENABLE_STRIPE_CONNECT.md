# 🔧 Enable Stripe Connect for Your Account

## Issue

When trying to create Stripe Connect accounts, you got this error:
```
"You can only create new accounts if you've signed up for Connect"
```

This means your Stripe account needs to enable the **Connect/Platform** features first.

---

## Solution: Enable Stripe Connect (5 minutes)

### Step 1: Go to Stripe Dashboard

```bash
# Open Stripe dashboard
open https://dashboard.stripe.com
```

Or for test mode:
```bash
open https://dashboard.stripe.com/test/dashboard
```

### Step 2: Enable Connect

1. Click on your **profile/settings** (top right)
2. Go to **Settings** → **Connect**
3. Or directly visit: https://dashboard.stripe.com/settings/applications

### Step 3: Complete Platform Setup

Stripe will ask you to:

1. **Business information**
   - Business name: "EatCaterly" or "SMS Food Delivery"
   - Business website: https://sms-food-delivery.vercel.app
   - Business description: "SMS-based food ordering platform for restaurants"

2. **Platform details**
   - Platform type: **Marketplace**
   - How you charge: **Application fees**
   - Fee percentage: **2%**

3. **Accept terms**
   - Review and accept Stripe Connect terms

### Step 4: Verify Setup

After enabling, verify by running:

```bash
curl -X POST http://localhost:3000/api/stripe-connect/create-account \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com"}'
```

**Before:** Error about not signed up for Connect
**After:** Should return `{"success": true, "accountId": "acct_...", "onboardingUrl": "https://connect.stripe.com/..."}`

---

## Alternative: Use Test Mode Without Full Setup

If you just want to test the code logic without going through Stripe Connect setup:

### Option A: Mock Stripe Connect Account (Quick Test)

Add a fake Stripe Connect ID directly to database:

```javascript
// Run this script: test-without-connect.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addFakeConnectAccount() {
  await prisma.businessCustomer.update({
    where: { contactEmail: 'test2@example.com' },
    data: {
      stripeConnectAccountId: 'acct_test_fake123',  // Fake account ID
      stripeOnboardingComplete: true,
      stripeChargesEnabled: true,
      stripeAccountStatus: 'active'
    }
  })
  console.log('✅ Added fake Stripe Connect account for testing')
}

addFakeConnectAccount()
```

**Note:** This will fail when actually creating payment links, but you can test the validation logic.

### Option B: Skip to Production Setup

If you're ready to go live and don't need localhost testing:

1. Use your **live Stripe keys** (not test keys)
2. Enable Stripe Connect in live mode
3. Deploy to production
4. Test with real (small amount) transactions

---

## What This Enables

Once Stripe Connect is enabled, you'll be able to:

✅ Create Stripe Express accounts for businesses
✅ Businesses can complete onboarding
✅ Accept payments on behalf of businesses
✅ Collect 2% platform fee automatically
✅ Businesses receive payouts to their bank accounts

---

## Next Steps After Enabling

1. **Enable Connect** (see steps above)
2. **Run create account API again**:
   ```bash
   curl -X POST http://localhost:3000/api/stripe-connect/create-account \
     -H "Content-Type: application/json" \
     -d '{"email":"test2@example.com"}'
   ```

3. **You'll get an onboarding URL**:
   ```json
   {
     "success": true,
     "accountId": "acct_abc123",
     "onboardingUrl": "https://connect.stripe.com/setup/s/abc123"
   }
   ```

4. **Open the onboarding URL** in your browser

5. **Complete onboarding with test data**:
   - Business type: Individual or Company
   - Tax ID: 000-00-0000
   - Bank routing: 110000000
   - Bank account: 000123456789

6. **Continue with testing** from START_HERE.md Step 3

---

## Support Links

- **Stripe Connect Setup**: https://dashboard.stripe.com/settings/applications
- **Connect Documentation**: https://stripe.com/docs/connect
- **Test Account Numbers**: https://stripe.com/docs/connect/testing

---

## Summary

**The Issue**: Your Stripe account doesn't have Connect enabled yet
**The Fix**: Enable Connect in Stripe Dashboard (5 minutes)
**The Result**: You'll be able to create Express accounts for your businesses

After this is done, continue with **START_HERE.md** for the complete testing flow!
