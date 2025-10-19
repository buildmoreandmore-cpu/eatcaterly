# 🚀 START HERE: Localhost Testing Setup

## Current Status

✅ **What's Ready:**
- Dev server running: http://localhost:3000
- Code implementation complete (payment routing + 2% fee)
- Testing scripts created
- 5 businesses in database

⚠️ **What's Needed:**
- No businesses have Stripe Connect accounts yet
- Database migration pending (businessId + platformFee fields)

---

## 🎯 Your Mission: Test the 2% Platform Fee

You want to verify that when a customer orders food:
1. Payment goes to the **business** (not you)
2. You automatically collect **2% platform fee**
3. Business gets the rest (minus Stripe fees)

**Example:**
- Customer orders $29.00 of food
- Business receives: $28.42 (minus fees)
- **You receive: $0.58 (2% fee)** ← This is what we're testing!

---

## 📋 Step-by-Step Testing (15 minutes)

### Step 1: Set Up Stripe Connect (5 min)

**Why:** Businesses need their own Stripe account to receive payments.

```bash
# 1. Open admin panel
open http://localhost:3000/admin/account

# 2. Select any business:
#    - Mike Example
#    - Test Pizza Shop
#    - Test Pizza

# 3. Click "Connect Stripe Account"

# 4. Complete onboarding with TEST data:
#    - Tax ID: 000-00-0000
#    - Bank Routing: 110000000
#    - Bank Account: 000123456789
#    - Any US address

# 5. Return to your app after completing
```

---

### Step 2: Add Database Fields (2 min)

**Why:** Orders need `businessId` and `platformFee` fields.

**Option A: Try automatic migration**
```bash
npx prisma generate
npx prisma db push
```

**Option B: If timeout, use Supabase dashboard**
```bash
# 1. Go to https://supabase.com/dashboard
# 2. Select your project (you're already logged in)
# 3. Click "SQL Editor"
# 4. Run this SQL:

ALTER TABLE orders ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "platformFee" INTEGER;
ALTER TABLE orders ADD CONSTRAINT orders_businessId_fkey
  FOREIGN KEY ("businessId")
  REFERENCES business_customers(id);

# 5. Click "Run"
```

---

### Step 3: Create Test Order (1 min)

```bash
# This script will:
# - Find your business with Stripe Connect
# - Create a test customer
# - Create a test menu
# - Create an order for $29.00 with $0.58 platform fee

node create-test-order.js
```

**You'll see:**
```
✅ Using business: Test Pizza Shop
✅ Created test customer
✅ Created test menu
🎉 Test order created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: cm...
Total Amount: $29.00
Platform Fee (2%): $0.58
Business Gets: $28.42
```

---

### Step 4: Create Payment Link (1 min)

```bash
# Copy the Order ID from step 3, then:
curl -X POST "http://localhost:3000/api/orders/YOUR_ORDER_ID_HERE/payment"
```

**You'll get:**
```json
{
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
}
```

---

### Step 5: Complete Payment (2 min)

```bash
# 1. Copy the payment URL from step 4
# 2. Open it in your browser
# 3. Enter test card details:
```

**Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVC: `123`
- ZIP: `12345`

Click "Pay"

---

### Step 6: Verify Platform Fee (2 min)

**Check your Stripe dashboard:**

```bash
# Open Stripe dashboard
open https://dashboard.stripe.com/test/connect/applications/fees
```

**You should see:**
- ✅ Application fee: **$0.58** (2% of $29.00)
- ✅ Status: Available
- ✅ Connected account: Your business's Stripe account

**This is your revenue!** 💰

---

## 🔍 Understanding The Two Payment Types

### Type 1: Subscription Payments (Already Working)
```
Business → Pays YOU directly
$30 one-time + $35/month or $95/month
```
**Where to see:** Stripe Dashboard → Payments

This is what you saw in your screenshot ($30 payment).

---

### Type 2: Food Order Payments (What We Built)
```
Customer → Pays BUSINESS → You get 2% automatically
Example: $100 order = $2 to you, $98 to business
```
**Where to see:** Stripe Dashboard → Connect → Application Fees

This is what you need to test now!

---

## 🛠️ Helper Commands

```bash
# Check if businesses have Stripe Connect
node check-business-setup.js

# Create test order
node create-test-order.js

# View all documentation
ls -l *.md

# Open testing guide
open LOCALHOST_TESTING_GUIDE.md

# Restart dev server if needed
lsof -ti:3000 | xargs kill
npm run dev
```

---

## ❓ Quick Troubleshooting

### "Business has not connected a Stripe account"
→ Complete Step 1 first

### "Unknown field businessId"
→ Complete Step 2 (database migration)

### Database migration timeout
→ Use Option B in Step 2 (Supabase SQL Editor)

### Payment link creation fails
→ Run `node check-business-setup.js` to see what's missing

### Don't see platform fee in Stripe
→ Make sure you're looking at:
  - TEST mode (not Live)
  - Connect → Application Fees (not just Payments)

---

## 📚 Complete Documentation

1. **START_HERE.md** ← You are here
2. **LOCALHOST_TESTING_GUIDE.md** - Detailed testing instructions
3. **IMPLEMENTATION_SUMMARY.md** - What was built
4. **TESTING_GUIDE.md** - Comprehensive test scenarios
5. **VERIFICATION_RESULTS.md** - Test results (12/12 passing)

---

## 🎯 Ready to Start?

**Open your terminal and run:**

```bash
# 1. Check current status
node check-business-setup.js

# 2. If no Stripe Connect, set it up:
open http://localhost:3000/admin/account

# 3. After Stripe Connect is ready:
node create-test-order.js

# 4. Follow the instructions from the script output
```

---

**Questions?** Check LOCALHOST_TESTING_GUIDE.md for detailed explanations!

**Stuck?** Run `node check-business-setup.js` to see exactly what's needed.
