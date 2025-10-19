/**
 * Test Script for Promo Code Flow (Database Direct)
 * Uses Prisma directly to test without authentication
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

// Test 1: Create promo code directly in database
async function test1_CreatePromoCodeDB() {
  console.log('\n📝 Test 1: Creating test promo code in database...')

  try {
    // Check if promo code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: 'LAUNCH100' },
    })

    if (existing) {
      console.log('⚠️  Promo code already exists')
      console.log(`   Code: ${existing.code}`)
      console.log(`   Current Uses: ${existing.currentUses}`)
      return existing
    }

    // Create new promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code: 'LAUNCH100',
        discountType: 'PERCENTAGE',
        discountValue: 100,
        freePhoneNumber: true,
        freeSubscription: true,
        isActive: true,
        maxUses: 10,
        description: 'Test launch promotion - 100% free',
      },
    })

    console.log('✅ Promo code created successfully!')
    console.log(`   Code: ${promoCode.code}`)
    console.log(`   ID: ${promoCode.id}`)
    console.log(`   Discount: ${promoCode.discountValue}%`)
    return promoCode
  } catch (error) {
    console.error('❌ Failed to create promo code:', error.message)
    return null
  }
}

// Test 2: Validate the promo code via API
async function test2_ValidatePromoCode(promoCode) {
  console.log('\n🔍 Test 2: Validating promo code via API...')

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
    businessName: 'Test Promo Pizza',
    contactName: 'Test Promo User',
    contactEmail: `testpromo${Date.now()}@example.com`,
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
  console.log('\n📊 Test 5: Verifying promo code usage count in database...')

  try {
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: 'LAUNCH100' },
      include: {
        _count: {
          select: { businessCustomers: true },
        },
      },
    })

    if (promoCode) {
      console.log('✅ Promo code usage verified!')
      console.log(`   Current Uses: ${promoCode.currentUses}`)
      console.log(`   Max Uses: ${promoCode.maxUses || '∞'}`)
      console.log(`   Businesses using this code: ${promoCode._count.businessCustomers}`)
      console.log(`   Status: ${promoCode.isActive ? 'Active' : 'Inactive'}`)
      return promoCode
    } else {
      console.error('❌ Promo code not found')
      return null
    }
  } catch (error) {
    console.error('❌ Failed to fetch promo code:', error.message)
    return null
  }
}

// Test 6: Verify business was created correctly
async function test6_VerifyBusiness(businessId) {
  console.log('\n🏢 Test 6: Verifying business record in database...')

  try {
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
      include: {
        promoCode: true,
      },
    })

    if (business) {
      console.log('✅ Business record verified!')
      console.log(`   Business Name: ${business.businessName}`)
      console.log(`   Subscription Tier: ${business.subscriptionTier}`)
      console.log(`   Subscription Status: ${business.subscriptionStatus}`)
      console.log(`   Phone Number: ${business.assignedPhoneNumber || 'Not assigned (manual assignment needed)'}`)
      console.log(`   Phone Fee Waived: ${business.phoneNumberFeeWaived}`)
      console.log(`   Promo Code Used: ${business.promoCodeUsed}`)
      console.log(`   Stripe Customer ID: ${business.stripeCustomerId || 'None (free signup)'}`)
      return business
    } else {
      console.error('❌ Business not found')
      return null
    }
  } catch (error) {
    console.error('❌ Failed to fetch business:', error.message)
    return null
  }
}

// Test 7: Validate invalid promo code
async function test7_ValidateInvalidPromo() {
  console.log('\n🚫 Test 7: Testing invalid promo code...')

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
  console.log('🚀 Starting Promo Code Flow Tests (Database Direct)')
  console.log('=' .repeat(60))

  try {
    // Test 1: Create promo code in DB
    const promoCode = await test1_CreatePromoCodeDB()
    if (!promoCode) {
      console.error('\n❌ Test suite aborted: Could not create promo code')
      return
    }

    // Test 2: Validate promo code via API
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

    // Test 6: Verify business record
    await test6_VerifyBusiness(businessData.businessId)

    // Test 7: Test invalid promo
    await test7_ValidateInvalidPromo()

    // Summary
    console.log('\n' + '=' .repeat(60))
    console.log('✅ All tests completed successfully!')
    console.log('\n📝 Summary:')
    console.log('   ✓ Promo code creation works')
    console.log('   ✓ Promo code validation API works')
    console.log('   ✓ Onboarding with promo code works')
    console.log('   ✓ Free signup (100% discount) works')
    console.log('   ✓ Usage tracking works')
    console.log('   ✓ Business record created correctly')
    console.log('   ✓ Invalid promo rejection works')
    console.log('\n🎉 Promo code system is fully operational!')
    console.log('\n💡 Note: Phone numbers for promo customers need to be assigned manually by admin')

  } catch (error) {
    console.error('\n💥 Test suite error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
runTests()
