/**
 * Setup Stripe Connect Account for Test Business
 * Run with: node setup-stripe-connect.js
 */

async function setupStripeConnect() {
  console.log('🔧 Setting up Stripe Connect for Test Pizza Shop...\n')

  try {
    const response = await fetch('http://localhost:3000/api/stripe-connect/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test2@example.com',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.log('❌ Error:', data.error)

      if (data.error.includes('signed up for Connect')) {
        console.log('\n📝 You need to enable Stripe Connect:')
        console.log('1. Go to: https://dashboard.stripe.com/settings/applications')
        console.log('2. Click "Get Started" or "Enable Connect"')
        console.log('3. Fill out the form (business name, website, etc.)')
        console.log('4. Run this script again\n')
      }

      return
    }

    console.log('✅ Success!\n')
    console.log('Account ID:', data.accountId)

    if (data.existing) {
      console.log('(This is an existing account - continuing onboarding)\n')
    }

    console.log('📋 Next Steps:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n1️⃣  Copy this URL and open it in your browser:\n')
    console.log(data.onboardingUrl)
    console.log('\n2️⃣  Complete Stripe onboarding with TEST data:')
    console.log('   - Tax ID: 000-00-0000')
    console.log('   - Bank Routing Number: 110000000')
    console.log('   - Bank Account Number: 000123456789')
    console.log('   - Address: Any US address\n')
    console.log('3️⃣  After completing onboarding, run:')
    console.log('   node create-test-order.js\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n⚠️  Make sure your dev server is running:')
    console.log('   npm run dev\n')
  }
}

setupStripeConnect()
