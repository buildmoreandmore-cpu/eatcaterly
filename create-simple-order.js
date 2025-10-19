/**
 * Create Simple Test Order (2 items only)
 * Run with: node create-simple-order.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createSimpleOrder() {
  console.log('🧪 Creating simple test order...\n')

  try {
    const business = await prisma.businessCustomer.findFirst({
      where: {
        stripeConnectAccountId: { not: null },
        stripeChargesEnabled: true,
      },
    })

    if (!business) {
      console.log('❌ No business found')
      return
    }

    let customer = await prisma.customer.findFirst({
      where: { phoneNumber: '+15555551234' },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phoneNumber: '+15555551234',
          name: 'Test Customer',
        },
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let menu = await prisma.menu.findFirst({
      where: { date: today },
      include: { menuItems: true },
    })

    if (!menu) {
      menu = await prisma.menu.create({
        data: {
          date: today,
          title: 'Simple Test Menu',
          isActive: true,
        },
        include: { menuItems: true },
      })
    }

    // Create simple order with just 2 items (not 20!)
    const orderItems = [
      {
        name: 'Test Burger',
        description: 'Delicious burger',
        price: 1200, // $12.00
        quantity: 2,
      },
      {
        name: 'Test Fries',
        description: 'Crispy fries',
        price: 500, // $5.00
        quantity: 1,
      },
    ]

    const totalAmount = 2900 // $29.00
    const platformFee = Math.round(totalAmount * 0.02) // $0.58

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        businessId: business.id,
        menuId: menu.id,
        items: orderItems, // Simple array of 2 items
        totalAmount: totalAmount,
        platformFee: platformFee,
        status: 'PENDING',
      },
    })

    console.log('✅ Simple order created!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Order ID: ${order.id}`)
    console.log(`Items: ${orderItems.length} items`)
    console.log(`Total: $${(totalAmount / 100).toFixed(2)}`)
    console.log(`Platform Fee: $${(platformFee / 100).toFixed(2)}`)
    console.log('\n📝 Create payment link:')
    console.log(`curl -X POST "http://localhost:3000/api/orders/${order.id}/payment"`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createSimpleOrder()
