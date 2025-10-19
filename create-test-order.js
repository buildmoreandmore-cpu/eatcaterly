/**
 * Create Test Order for Platform Fee Testing
 * Run with: node create-test-order.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestOrder() {
  console.log('🧪 Creating test order for platform fee testing...\n')

  try {
    // Get first business with Stripe Connect
    const business = await prisma.businessCustomer.findFirst({
      where: {
        stripeConnectAccountId: { not: null },
        stripeChargesEnabled: true,
      },
    })

    if (!business) {
      console.log('❌ No business with Stripe Connect found!')
      console.log('\n📝 Please complete Stripe Connect setup first:')
      console.log('1. Go to http://localhost:3000/admin/account')
      console.log('2. Select a business')
      console.log('3. Click "Connect Stripe Account"')
      console.log('4. Complete onboarding with test data')
      console.log('5. Run this script again')
      return
    }

    console.log(`✅ Using business: ${business.businessName}`)
    console.log(`   Business ID: ${business.id}`)
    console.log(`   Stripe Connect ID: ${business.stripeConnectAccountId}`)

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
    console.log(`   Customer ID: ${customer.id}`)

    // Get or create a test menu
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let menu = await prisma.menu.findFirst({
      where: { date: today },
      include: { menuItems: true },
    })

    if (!menu || menu.menuItems.length === 0) {
      menu = await prisma.menu.create({
        data: {
          date: today,
          title: 'Test Menu for Platform Fee',
          isActive: true,
          menuItems: {
            create: [
              {
                name: 'Test Burger',
                description: 'Delicious test burger for platform fee testing',
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
              {
                name: 'Test Drink',
                description: 'Refreshing test beverage',
                price: 300, // $3.00
                category: 'drink',
                isAvailable: true,
              },
            ],
          },
        },
        include: { menuItems: true },
      })
      console.log('✅ Created test menu with 3 items')
    } else {
      console.log('✅ Using existing menu')
    }
    console.log(`   Menu ID: ${menu.id}`)
    console.log(`   Menu Title: ${menu.title}`)
    console.log(`   Items: ${menu.menuItems.length}`)

    // Create test order with platform fee
    const orderItems = [
      { name: 'Test Burger', price: 1200, quantity: 2 },
      { name: 'Test Fries', price: 500, quantity: 1 },
    ]
    const totalAmount = 2900 // $29.00 (2 burgers + 1 fries)
    const platformFee = Math.round(totalAmount * 0.02) // 2% fee = $0.58

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        businessId: business.id,
        menuId: menu.id,
        items: JSON.stringify(orderItems),
        totalAmount: totalAmount,
        platformFee: platformFee,
        status: 'PENDING',
        notes: 'Test order for platform fee verification',
      },
    })

    console.log('\n🎉 Test order created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Order ID: ${order.id}`)
    console.log(`Total Amount: $${(order.totalAmount / 100).toFixed(2)}`)
    console.log(`Platform Fee (2%): $${(order.platformFee / 100).toFixed(2)}`)
    console.log(`Business Gets: $${((totalAmount - platformFee) / 100).toFixed(2)} (minus Stripe fees)`)
    console.log(`Status: ${order.status}`)
    console.log(`Created: ${order.createdAt}`)

    console.log('\n📝 Next Steps:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n1️⃣  Create payment link:')
    console.log(`   curl -X POST "http://localhost:3000/api/orders/${order.id}/payment"`)
    console.log('\n2️⃣  Open the payment URL from the response')
    console.log('\n3️⃣  Complete payment with test card:')
    console.log('   Card: 4242 4242 4242 4242')
    console.log('   Expiry: 12/25')
    console.log('   CVC: 123')
    console.log('\n4️⃣  Verify platform fee in Stripe Dashboard:')
    console.log('   https://dashboard.stripe.com/test/connect/applications/fees')
    console.log('\n5️⃣  Expected results:')
    console.log(`   - Application fee: $${(platformFee / 100).toFixed(2)} (2%)`)
    console.log('   - Status: Available')
    console.log('   - Connected account: ' + business.stripeConnectAccountId)

  } catch (error) {
    console.error('\n❌ Error:', error.message)

    if (error.message.includes('Unknown field')) {
      console.log('\n⚠️  Database migration needed!')
      console.log('The businessId and platformFee fields need to be added to the orders table.')
      console.log('\nOptions:')
      console.log('1. Run: npx prisma generate && npx prisma db push')
      console.log('2. Or use Supabase SQL Editor to add fields manually')
      console.log('\nSee LOCALHOST_TESTING_GUIDE.md for details.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrder()
