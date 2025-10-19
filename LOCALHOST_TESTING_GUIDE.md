# 🧪 Localhost Testing Guide for 2% Platform Fee

## Current Status
- ✅ Dev server running: http://localhost:3000
- ✅ Code implementation complete
- ⚠️  Database migration needed (businessId + platformFee fields)
- ⚠️  No businesses have Stripe Connect accounts yet

## Quick Start: 3 Steps to Test Platform Fee

### Step 1: Set Up Stripe Connect for a Test Business

**1.1 Open your localhost admin panel:**
```bash
# Server is already running on:
http://localhost:3000/admin/account
```

**1.2 Select one of your existing businesses:**
- Mike Example (ID: cmgsr6ls000003aro94mk39fd)
- Test Pizza Shop (ID: cmgsrd55m00013aro4yuwb0p5)
- Test Pizza (ID: cmgqxc6im0002vf4x2ximyrmh)

**1.3 Click "Connect Stripe Account" button**
- This will create a Stripe Connect Express account
- Complete the onboarding with TEST data:
  - Business type: Individual or Company
  - Tax ID: 000-00-0000 (test data)
  - Bank account:
    - Routing: 110000000
    - Account: 000123456789
  - Address: Any US address

**1.4 Complete onboarding and return to your app**

---

### Step 2: Apply Database Migration

Once Stripe Connect is set up, we need to add the businessId and platformFee fields:

**Option A: Try migration again (may timeout)**
```bash
npx prisma generate
npx prisma db push
```

**Option B: Manual SQL migration (if timeout continues)**
```bash
# Connect to your database
psql "postgresql://postgres.xsyjqtcxxeeyylzyswcl:0ah8qTU7gVdUZz2j@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# Run these SQL commands:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "platformFee" INTEGER;

# Create foreign key (optional but recommended)
ALTER TABLE orders ADD CONSTRAINT orders_businessId_fkey
  FOREIGN KEY ("businessId")
  REFERENCES business_customers(id);

# Exit psql
\q
```

**Option C: Use Supabase dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Run the same SQL commands as Option B

---

### Step 3: Create Test Order and Payment

**3.1 Create a test helper script:**

Save this as `create-test-order.js`:
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestOrder() {
  // Get first business with Stripe Connect
  const business = await prisma.businessCustomer.findFirst({
    where: {
      stripeConnectAccountId: { not: null },
      stripeChargesEnabled: true,
    },
  })

  if (!business) {
    console.log('❌ No business with Stripe Connect found!')
    console.log('Please set up Stripe Connect first.')
    return
  }

  console.log(`✅ Using business: ${business.businessName}`)

  // Get or create a test customer
  let customer = await prisma.customer.findFirst({
    where: { phoneNumber: '+15555551234' },
  })

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        phoneNumber: '+15555551234',
        name: 'Test Customer',
        email: 'test-customer@example.com',
      },
    })
    console.log('✅ Created test customer')
  } else {
    console.log('✅ Using existing test customer')
  }

  // Get or create a test menu
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let menu = await prisma.menu.findFirst({
    where: { date: today },
  })

  if (!menu) {
    menu = await prisma.menu.create({
      data: {
        date: today,
        title: 'Test Menu',
        isActive: true,
        menuItems: {
          create: [
            {
              name: 'Test Burger',
              description: 'Delicious test burger',
              price: 1200, // $12.00
              category: 'main',
              isAvailable: true,
            },
            {
              name: 'Test Fries',
              description: 'Crispy test fries',
              price: 500, // $5.00
              category: 'side',
              isAvailable: true,
            },
          ],
        },
      },
    })
    console.log('✅ Created test menu with items')
  } else {
    console.log('✅ Using existing menu')
  }

  // Create test order
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      businessId: business.id,
      menuId: menu.id,
      items: JSON.stringify([
        { name: 'Test Burger', price: 1200, quantity: 2 },
        { name: 'Test Fries', price: 500, quantity: 1 },
      ]),
      totalAmount: 2900, // $29.00
      platformFee: Math.round(2900 * 0.02), // $0.58 (2%)
      status: 'PENDING',
    },
  })

  console.log('\n✅ Test order created!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Order ID: ${order.id}`)
  console.log(`Total Amount: $${(order.totalAmount / 100).toFixed(2)}`)
  console.log(`Platform Fee (2%): $${(order.platformFee / 100).toFixed(2)}`)
  console.log(`Business ID: ${business.id}`)
  console.log(`Customer ID: ${customer.id}`)
  console.log('\n📝 Next step: Create payment link')
  console.log(`curl -X POST "http://localhost:3000/api/orders/${order.id}/payment"`)

  await prisma.$disconnect()
}

createTestOrder().catch(console.error)
```

**3.2 Run the script:**
```bash
node create-test-order.js
```

**3.3 Create payment link via API:**
```bash
# Use the order ID from step 3.2
curl -X POST "http://localhost:3000/api/orders/YOUR_ORDER_ID_HERE/payment" \
  -H "Content-Type: application/json" \
  | jq
```

**3.4 You should get a response like:**
```json
{
  "success": true,
  "data": {
    "paymentLinkId": "plink_test_...",
    "url": "https://checkout.stripe.com/c/pay/..."
  }
}
```

**3.5 Complete the test payment:**
1. Open the payment URL in your browser
2. Use test card: **4242 4242 4242 4242**
3. Expiry: Any future date (e.g., 12/25)
4. CVC: Any 3 digits (e.g., 123)
5. Complete the payment

---

### Step 4: Verify Platform Fee Collection

**4.1 Check Stripe Dashboard:**

Go to: https://dashboard.stripe.com/test/connect/applications/fees

**You should see:**
- ✅ Application fee: $0.58 (2% of $29.00)
- ✅ Connected account: Your business's Stripe account
- ✅ Status: Available

**4.2 Check Connected Account Dashboard:**

Go to: https://dashboard.stripe.com/test/connect/accounts

Click on the business account → Payments

**You should see:**
- ✅ Payment: $29.00
- ✅ Application fee deducted: $0.58
- ✅ Net to business: $28.42 (minus Stripe fees)

**4.3 Check your database:**
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.order.findMany({
  where: { platformFee: { not: null } },
  orderBy: { createdAt: 'desc' },
  take: 5
}).then(orders => {
  console.log('Orders with platform fees:');
  orders.forEach(o => {
    console.log(\`  - \${o.id}: \$\${(o.totalAmount/100).toFixed(2)} (fee: \$\${(o.platformFee/100).toFixed(2)})\`);
  });
  prisma.\$disconnect();
});
"
```

---

## Alternative: Quick Test via cURL

If you want to test without the UI:

```bash
# 1. Create Stripe Connect account for business
curl -X POST "http://localhost:3000/api/stripe-connect/create-account" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "cmgsr6ls000003aro94mk39fd",
    "email": "test@example1.com"
  }'

# 2. Get onboarding URL from response and complete in browser

# 3. Create test order (after migration)
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "YOUR_CUSTOMER_ID",
    "businessId": "cmgsr6ls000003aro94mk39fd",
    "menuId": "YOUR_MENU_ID",
    "items": [{"name": "Test Item", "price": 2900, "quantity": 1}],
    "totalAmount": 2900
  }'

# 4. Create payment link
curl -X POST "http://localhost:3000/api/orders/YOUR_ORDER_ID/payment"

# 5. Complete payment in browser with test card
```

---

## Troubleshooting

### Issue: "Business has not connected a Stripe account"
**Fix:** Complete Step 1 first (Stripe Connect setup)

### Issue: "Unknown field `businessId`"
**Fix:** Apply database migration (Step 2)

### Issue: Database migration timeout
**Fix:** Use Option B or C in Step 2 (manual SQL or Supabase dashboard)

### Issue: No platform fee in Stripe dashboard
**Check:**
1. Are you looking at TEST mode dashboard?
2. Go to Connect → Application Fees (not just Payments)
3. Did the payment complete successfully?
4. Check the order has platformFee set in database

### Issue: Payment link creation fails
**Check:**
1. Business has stripeConnectAccountId?
2. Business stripeOnboardingComplete is true?
3. Business stripeChargesEnabled is true?

Run the check script to verify:
```bash
node check-business-setup.js
```

---

## Summary

**What you're testing:**
- Customer pays business for food order
- Business receives: Order total - Stripe fees - 2% platform fee
- You receive: 2% platform fee automatically

**Expected results:**
- $29.00 order
- Platform fee: $0.58 (2%)
- Business gets: $28.42 (minus Stripe processing fees)
- You get: $0.58 deposited to your Stripe account

**This is DIFFERENT from:**
- Subscription payments ($30, $35/month) - These go directly to you
- Food order payments - These go to business with 2% fee to you

---

## Quick Commands Reference

```bash
# Check business setup
node check-business-setup.js

# Create test order
node create-test-order.js

# Apply migration
npx prisma generate && npx prisma db push

# View database
npx prisma studio

# Check logs
tail -f .next/server.log

# Restart dev server
# Kill all running dev servers first:
lsof -ti:3000 | xargs kill
# Then start fresh:
npm run dev
```

---

**Ready to test?** Start with Step 1: Set up Stripe Connect for one business!
