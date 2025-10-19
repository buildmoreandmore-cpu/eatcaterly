/**
 * Check Business Setup for Testing
 * Run with: node check-business-setup.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkBusinessSetup() {
  console.log('🔍 Checking business setup for Stripe Connect testing...\n')

  try {
    // Get all businesses
    const businesses = await prisma.businessCustomer.findMany({
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        stripeConnectAccountId: true,
        stripeOnboardingComplete: true,
        stripeChargesEnabled: true,
        stripeAccountStatus: true,
      },
    })

    console.log(`📊 Found ${businesses.length} business(es)\n`)

    businesses.forEach((business, index) => {
      console.log(`\n--- Business ${index + 1} ---`)
      console.log(`ID: ${business.id}`)
      console.log(`Name: ${business.businessName}`)
      console.log(`Email: ${business.contactEmail}`)
      console.log(`Stripe Connect ID: ${business.stripeConnectAccountId || '❌ NOT SET'}`)
      console.log(`Onboarding Complete: ${business.stripeOnboardingComplete ? '✅ Yes' : '❌ No'}`)
      console.log(`Charges Enabled: ${business.stripeChargesEnabled ? '✅ Yes' : '❌ No'}`)
      console.log(`Account Status: ${business.stripeAccountStatus || 'N/A'}`)

      if (
        business.stripeConnectAccountId &&
        business.stripeOnboardingComplete &&
        business.stripeChargesEnabled
      ) {
        console.log('\n✅ This business is READY to accept payments!')
        console.log(`   Use this businessId for testing: ${business.id}`)
      } else {
        console.log('\n⚠️  This business needs Stripe Connect setup:')
        if (!business.stripeConnectAccountId) {
          console.log('   - Create Stripe Connect account')
        }
        if (!business.stripeOnboardingComplete) {
          console.log('   - Complete Stripe onboarding')
        }
        if (!business.stripeChargesEnabled) {
          console.log('   - Enable charges (happens after onboarding)')
        }
      }
    })

    // Check for existing orders
    console.log('\n\n📦 Checking existing orders...')
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        businessId: true,
        platformFee: true,
      },
    })

    if (orders.length > 0) {
      console.log(`Found ${orders.length} recent order(s):\n`)
      orders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`)
        console.log(`  ID: ${order.id}`)
        console.log(`  Total: $${(order.totalAmount / 100).toFixed(2)}`)
        console.log(`  Status: ${order.status}`)
        console.log(`  Business ID: ${order.businessId || '❌ NOT SET'}`)
        console.log(`  Platform Fee: ${order.platformFee ? `$${(order.platformFee / 100).toFixed(2)}` : '❌ NOT SET'}`)
        console.log(`  Created: ${order.createdAt}`)
        console.log('')
      })
    } else {
      console.log('No orders found. You\'ll need to create a test order.\n')
    }

    // Check for existing menus
    console.log('\n📋 Checking existing menus...')
    const menus = await prisma.menu.findMany({
      take: 3,
      orderBy: { date: 'desc' },
      include: {
        menuItems: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    })

    if (menus.length > 0) {
      console.log(`Found ${menus.length} menu(s):\n`)
      menus.forEach((menu, index) => {
        console.log(`Menu ${index + 1}:`)
        console.log(`  ID: ${menu.id}`)
        console.log(`  Title: ${menu.title || 'Untitled'}`)
        console.log(`  Date: ${menu.date}`)
        console.log(`  Active: ${menu.isActive ? '✅ Yes' : '❌ No'}`)
        console.log(`  Items: ${menu.menuItems.length}`)
        if (menu.menuItems.length > 0) {
          console.log('  Sample items:')
          menu.menuItems.slice(0, 3).forEach((item) => {
            console.log(`    - ${item.name}: $${(item.price / 100).toFixed(2)}`)
          })
        }
        console.log('')
      })
    } else {
      console.log('No menus found. You\'ll need to create a menu first.\n')
    }

    // Check for customers
    console.log('\n👥 Checking customers...')
    const customerCount = await prisma.customer.count()
    console.log(`Found ${customerCount} customer(s)`)

    if (customerCount > 0) {
      const sampleCustomer = await prisma.customer.findFirst()
      console.log(`Sample customer ID: ${sampleCustomer.id}`)
    }

    console.log('\n\n🎯 Next Steps:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const readyBusinesses = businesses.filter(
      (b) => b.stripeConnectAccountId && b.stripeOnboardingComplete && b.stripeChargesEnabled
    )

    if (readyBusinesses.length > 0) {
      console.log('✅ You have business(es) ready for testing!')
      console.log('\nTo test the 2% platform fee:')
      console.log('1. Go to http://localhost:3000')
      console.log('2. Create a new order (or use existing menu)')
      console.log('3. Generate payment link via API')
      console.log('4. Complete payment with test card: 4242 4242 4242 4242')
      console.log('5. Check Stripe Dashboard → Connect → Application Fees')
    } else {
      console.log('⚠️  You need to set up Stripe Connect first!')
      console.log('\nSteps:')
      console.log('1. Go to http://localhost:3000/admin/account')
      console.log('2. Click "Connect Stripe Account"')
      console.log('3. Complete Stripe Express onboarding')
      console.log('4. Come back and run this script again')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkBusinessSetup()
