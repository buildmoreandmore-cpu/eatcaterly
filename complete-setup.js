/**
 * Complete Setup Script for Testing Platform Fees
 * This creates a test business and sets up Stripe Connect
 * Run with: node complete-setup.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function completeSetup() {
  console.log('🚀 Complete Platform Fee Testing Setup\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Step 1: Create test business
    console.log('Step 1: Creating test business...')

    const testBusiness = await prisma.businessCustomer.upsert({
      where: { contactEmail: 'test-pizza@example.com' },
      update: {},
      create: {
        businessName: 'Test Pizza Shop',
        contactName: 'John Test',
        contactEmail: 'test-pizza@example.com',
        zipCode: '30301',
        assignedPhoneNumber: '+14045551234',
        areaCode: '404',
        city: 'Atlanta',
        state: 'GA',
        isActive: true,
        onboardingCompleted: true,
        subscriptionStatus: 'trial',
      },
    })

    console.log(`✅ Business created: ${testBusiness.businessName}`)
    console.log(`   Email: ${testBusiness.contactEmail}`)
    console.log(`   ID: ${testBusiness.id}\n`)

    // Step 2: Set up Stripe Connect
    console.log('Step 2: Creating Stripe Connect account...')

    const response = await fetch('http://localhost:3000/api/stripe-connect/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testBusiness.contactEmail,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.log('❌ Error:', data.error)

      if (data.error.includes('signed up for Connect')) {
        console.log('\n⚠️  You need to enable Stripe Connect first:')
        console.log('1. Go to: https://dashboard.stripe.com/settings/applications')
        console.log('2. Click "Get Started" or "Enable Connect"')
        console.log('3. Fill out the form')
        console.log('4. Run this script again\n')
      }

      await prisma.$disconnect()
      return
    }

    console.log('✅ Stripe Connect account created!')
    console.log(`   Account ID: ${data.accountId}`)

    if (data.existing) {
      console.log('   (Continuing existing account onboarding)\n')
    } else {
      console.log('   (New account created)\n')
    }

    // Step 3: Instructions
    console.log('\n🎉 Setup Complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📋 Next Steps:\n')
    console.log('1️⃣  Complete Stripe Onboarding:')
    console.log('   Copy and open this URL in your browser:\n')
    console.log(`   ${data.onboardingUrl}\n`)
    console.log('2️⃣  Use these TEST credentials:')
    console.log('   Tax ID: 000-00-0000')
    console.log('   Bank Routing: 110000000')
    console.log('   Bank Account: 000123456789')
    console.log('   Address: Any US address\n')
    console.log('3️⃣  After onboarding, create test order:')
    console.log('   node create-test-order.js\n')
    console.log('4️⃣  Generate payment link and complete payment\n')
    console.log('5️⃣  Verify 2% fee in Stripe Dashboard:')
    console.log('   https://dashboard.stripe.com/test/connect/applications/fees\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('❌ Error:', error.message)

    if (error.message.includes('fetch')) {
      console.log('\n⚠️  Make sure your dev server is running:')
      console.log('   npm run dev\n')
    }
  } finally {
    await prisma.$disconnect()
  }
}

completeSetup()
