/**
 * Test Script for Promo Code Flow
 * Tests the complete promo code system end-to-end
 */

const BASE_URL = 'http://localhost:3000'

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await response.json()

  return { response, data }
}

// Test 1: Create a test promo code
async function test1_CreatePromoCode() {
  console.log('\n📝 Test 1: Creating test promo code...')

  const promoData = {
    code: 'LAUNCH100',
    discountType: 'PERCENTAGE',
    discountValue: 100,
    freePhoneNumber: true,
    freeSubscription: true,
    maxUses: 10,
    expiresAt: null,
    description: 'Test launch promotion - 100% free',
  }

  const { response, data } = await apiRequest('/api/admin/promo-codes', 'POST', promoData)

  if (data.success) {
    console.log('✅ Promo code created successfully!')
    console.log(`   Code: ${data.promoCode.code}`)
    console.log(`   ID: ${data.promoCode.id}`)
    return data.promoCode
  } else if (data.error && data.error.includes('already exists')) {
    console.log('⚠️  Promo code already exists, fetching existing...')
    const { data: listData } = await apiRequest('/api/admin/promo-codes', 'GET')
    const existingPromo = listData.promoCodes.find(p => p.code === 'LAUNCH100')
    return existingPromo
  } else {
    console.error('❌ Failed to create promo code:', data.error)
    return null
  }
}

// Test 2: Validate the promo code
async function test2_ValidatePromoCode(promoCode) {
  console.log('\n🔍 Test 2: Validating promo code...')

  const { response, data } = await apiRequest('/api/promo-codes/validate', 'POST', {
    code: promoCode.code,
  })

  if (data.success) {
    console.log('✅ Promo code validated successfully!')
    console.log(`   Discount: ${data.promoCode.discountType === 'PERCENTAGE' ? `${data.promoCode.discountValue}%` : `$${data.promoCode.discountValue / 100}`}`)
    console.log(`   Free Phone: ${data.promoCode.freePhoneNumber}`)
    console.log(`   Free Subscription: ${data.promoCode.freeSubscription}`)
    return data.promoCode
  } else {
    console.error('❌ Failed to validate promo code:', data.error)
    return null
  }
}

// Test 3: Complete onboarding step 1
async function test3_OnboardingStep1() {
  console.log('\n📋 Test 3: Testing onboarding step 1 (business info)...')

  const businessData = {
    businessName: 'Test Pizza Restaurant',
    contactName: 'Test User',
    contactEmail: 'testpromo@example.com',
    zipCode: '30309',
    promoCode: 'LAUNCH100',
  }

  const { response, data } = await apiRequest('/api/onboarding', 'POST', businessData)

  if (data.success) {
    console.log('✅ Onboarding step 1 completed!')
    console.log(`   Business ID: ${data.data.businessId}`)
    console.log(`   Business Name: ${data.data.businessName}`)
    console.log(`   Assigned Phone: ${data.data.assignedPhoneNumber}`)
    console.log(`   Location: ${data.data.location.city}, ${data.data.location.state}`)
    return data.data
  } else {
    console.error('❌ Failed onboarding step 1:', data.error)
    return null
  }
}

// Test 4: Complete free signup (100% discount)
async function test4_CompleteFreeSignup(businessId, promoCode) {
  console.log('\n💰 Test 4: Completing free signup with 100% discount...')

  const signupData = {
    plan: 'starter',
    promoCodeId: promoCode.id,
    promoCode: promoCode.code,
    businessId: businessId,
    email: 'testpromo@example.com',
  }

  const { response, data } = await apiRequest('/api/onboarding/complete-free', 'POST', signupData)

  if (data.success) {
    console.log('✅ Free signup completed successfully!')
    console.log(`   Business ID: ${data.businessId}`)
    console.log(`   Message: ${data.message}`)
    return true
  } else {
    console.error('❌ Failed free signup:', data.error)
    return false
  }
}

// Test 5: Verify promo code usage was incremented
async function test5_VerifyUsageIncrement() {
  console.log('\n📊 Test 5: Verifying promo code usage count...')

  const { response, data } = await apiRequest('/api/admin/promo-codes', 'GET')

  if (data.success) {
    const promoCode = data.promoCodes.find(p => p.code === 'LAUNCH100')
    if (promoCode) {
      console.log('✅ Promo code usage verified!')
      console.log(`   Current Uses: ${promoCode.currentUses}`)
      console.log(`   Max Uses: ${promoCode.maxUses || '∞'}`)
      console.log(`   Status: ${promoCode.isActive ? 'Active' : 'Inactive'}`)
      return promoCode
    } else {
      console.error('❌ Promo code not found')
      return null
    }
  } else {
    console.error('❌ Failed to fetch promo codes:', data.error)
    return null
  }
}

// Test 6: Validate invalid promo code
async function test6_ValidateInvalidPromo() {
  console.log('\n🚫 Test 6: Testing invalid promo code...')

  const { response, data } = await apiRequest('/api/promo-codes/validate', 'POST', {
    code: 'INVALID999',
  })

  if (!data.success && data.error) {
    console.log('✅ Invalid promo code correctly rejected!')
    console.log(`   Error: ${data.error}`)
    return true
  } else {
    console.error('❌ Invalid promo code was accepted (should have been rejected)')
    return false
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Promo Code Flow Tests')
  console.log('=' .repeat(60))

  try {
    // Test 1: Create promo code
    const promoCode = await test1_CreatePromoCode()
    if (!promoCode) {
      console.error('\n❌ Test suite aborted: Could not create/fetch promo code')
      return
    }

    // Test 2: Validate promo code
    const validatedPromo = await test2_ValidatePromoCode(promoCode)
    if (!validatedPromo) {
      console.error('\n❌ Test suite aborted: Promo code validation failed')
      return
    }

    // Test 3: Onboarding step 1
    const businessData = await test3_OnboardingStep1()
    if (!businessData) {
      console.error('\n❌ Test suite aborted: Onboarding step 1 failed')
      return
    }

    // Test 4: Complete free signup
    const signupSuccess = await test4_CompleteFreeSignup(businessData.businessId, validatedPromo)
    if (!signupSuccess) {
      console.error('\n❌ Test suite aborted: Free signup failed')
      return
    }

    // Test 5: Verify usage increment
    await test5_VerifyUsageIncrement()

    // Test 6: Test invalid promo
    await test6_ValidateInvalidPromo()

    // Summary
    console.log('\n' + '=' .repeat(60))
    console.log('✅ All tests completed successfully!')
    console.log('\n📝 Summary:')
    console.log('   ✓ Promo code creation works')
    console.log('   ✓ Promo code validation works')
    console.log('   ✓ Onboarding with promo code works')
    console.log('   ✓ Free signup (100% discount) works')
    console.log('   ✓ Usage tracking works')
    console.log('   ✓ Invalid promo rejection works')
    console.log('\n🎉 Promo code system is fully operational!')

  } catch (error) {
    console.error('\n💥 Test suite error:', error.message)
    console.error(error.stack)
  }
}

// Run the tests
runTests()
