/**
 * Skip Stripe onboarding by manually marking business as ready
 * This is for testing purposes only
 * Run with: node skip-onboarding.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function skipOnboarding() {
  console.log('🔧 Manually marking business as ready for testing...\n')

  try {
    const business = await prisma.businessCustomer.update({
      where: { contactEmail: 'test-pizza@example.com' },
      data: {
        stripeOnboardingComplete: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
        stripeDashboardEnabled: true,
        stripeDetailsSubmitted: true,
        stripeAccountStatus: 'active',
      },
    })

    console.log('✅ Business marked as ready!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('Business:', business.businessName)
    console.log('Stripe Connect ID:', business.stripeConnectAccountId)
    console.log('Status:', business.stripeAccountStatus)
    console.log('Charges Enabled:', business.stripeChargesEnabled ? '✅' : '❌')
    console.log('Onboarding Complete:', business.stripeOnboardingComplete ? '✅' : '❌')

    console.log('\n🎉 Ready to test!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('Next step: Create a test order')
    console.log('Run: node create-test-order.js\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

skipOnboarding()
