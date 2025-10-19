/**
 * @jest-environment node
 */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

// Create mock functions outside the factory
const mockProvisionPhoneNumber = jest.fn()
const mockReleasePhoneNumber = jest.fn()

// Mock the EZ Texting module - must be hoisted
jest.mock('@/lib/ez-texting', () => {
  return {
    __esModule: true,
    default: {
      get provisionPhoneNumber() {
        return mockProvisionPhoneNumber
      },
      get releasePhoneNumber() {
        return mockReleasePhoneNumber
      },
      getPhoneNumberDetails: jest.fn(),
    },
  }
})

// Mock Stripe webhook signature verification
jest.mock('stripe', () => {
  const actualStripe = jest.requireActual('stripe') as any
  return {
    __esModule: true,
    default: class MockStripe extends actualStripe.default {
      webhooks = {
        constructEvent: jest.fn((body: string, signature: string, secret: string) => {
          return JSON.parse(body)
        }),
      }
    },
  }
})

describe('Stripe Webhook - Phone Provisioning', () => {
  let testBusinessId: string
  let testEmail: string

  beforeEach(async () => {
    // Create a test business customer
    testEmail = `test-${Date.now()}@example.com`
    const business = await prisma.businessCustomer.create({
      data: {
        businessName: 'Test Pizza Shop',
        contactName: 'Test User',
        contactEmail: testEmail,
        zipCode: '30309',
        assignedPhoneNumber: '404-555-0101',
        areaCode: '404',
        city: 'Atlanta',
        state: 'GA',
        isActive: true,
        onboardingCompleted: false,
      },
    })
    testBusinessId = business.id

    // Clear mock calls
    jest.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.businessCustomer.delete({
      where: { id: testBusinessId },
    })
  })

  test('should provision phone number after successful checkout', async () => {
    // Mock successful phone provisioning
    mockProvisionPhoneNumber.mockResolvedValueOnce({
      success: true,
      phoneNumber: '+14045551234',
      numberId: 'eztn_123456',
      areaCode: '404',
    })

    // Simulate Stripe checkout.session.completed webhook
    const webhookEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          customer_email: testEmail,
          metadata: {
            businessId: testBusinessId,
            plan: 'starter',
          },
          payment_status: 'paid',
        },
      },
    }

    // Import and call the webhook handler directly
    const { handleWebhook } = await import('@/lib/stripe')
    const result = await handleWebhook(JSON.stringify(webhookEvent), 'test_signature')

    expect(result.success).toBe(true)

    // Verify phone was provisioned
    expect(mockProvisionPhoneNumber).toHaveBeenCalledWith('404')

    // Verify database was updated
    const updatedBusiness = await prisma.businessCustomer.findUnique({
      where: { id: testBusinessId },
    })

    expect(updatedBusiness?.assignedPhoneNumber).toBe('+14045551234')
    expect(updatedBusiness?.ezTextingNumberId).toBe('eztn_123456')
    expect(updatedBusiness?.numberProvisionedAt).toBeDefined()
  })

  test('should use fallback area code when requested area code unavailable', async () => {
    // Mock provisioning with fallback
    mockProvisionPhoneNumber.mockResolvedValueOnce({
      success: true,
      phoneNumber: '+14705551234',
      numberId: 'eztn_789012',
      areaCode: '470',
      fallbackUsed: true,
    })

    const webhookEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          customer_email: testEmail,
          metadata: {
            businessId: testBusinessId,
            plan: 'starter',
          },
          payment_status: 'paid',
        },
      },
    }

    const { handleWebhook } = await import('@/lib/stripe')
    const result = await handleWebhook(JSON.stringify(webhookEvent), 'test_signature')

    expect(result.success).toBe(true)

    // Verify fallback number was assigned
    const updatedBusiness = await prisma.businessCustomer.findUnique({
      where: { id: testBusinessId },
    })

    expect(updatedBusiness?.assignedPhoneNumber).toBe('+14705551234')
    expect(updatedBusiness?.areaCode).toBe('470')
  })

  test('should handle provisioning failures gracefully', async () => {
    // Mock provisioning failure
    mockProvisionPhoneNumber.mockResolvedValueOnce({
      success: false,
      error: 'No available phone numbers',
    })

    const webhookEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          customer_email: testEmail,
          metadata: {
            businessId: testBusinessId,
            plan: 'starter',
          },
          payment_status: 'paid',
        },
      },
    }

    const { handleWebhook } = await import('@/lib/stripe')
    const result = await handleWebhook(JSON.stringify(webhookEvent), 'test_signature')

    // Webhook should still return success to acknowledge receipt
    expect(result.success).toBe(true)

    // Verify provisioning was attempted
    expect(mockProvisionPhoneNumber).toHaveBeenCalled()

    // Database should not be updated with new number
    const updatedBusiness = await prisma.businessCustomer.findUnique({
      where: { id: testBusinessId },
    })

    expect(updatedBusiness?.assignedPhoneNumber).toBe('404-555-0101') // Original number
    expect(updatedBusiness?.ezTextingNumberId).toBeNull()
  })

  test('should store Stripe subscription ID in database', async () => {
    mockProvisionPhoneNumber.mockResolvedValueOnce({
      success: true,
      phoneNumber: '+14045551234',
      numberId: 'eztn_123456',
      areaCode: '404',
    })

    const webhookEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          customer_email: testEmail,
          metadata: {
            businessId: testBusinessId,
            plan: 'starter',
          },
          payment_status: 'paid',
        },
      },
    }

    const { handleWebhook } = await import('@/lib/stripe')
    const result = await handleWebhook(JSON.stringify(webhookEvent), 'test_signature')

    expect(result.success).toBe(true)

    const updatedBusiness = await prisma.businessCustomer.findUnique({
      where: { id: testBusinessId },
    })

    expect(updatedBusiness?.stripeCustomerId).toBe('cus_test_123')
    expect(updatedBusiness?.stripeSubscriptionId).toBe('sub_test_123')
  })

  test('should handle customer.subscription.deleted event', async () => {
    // First, set up a business with a phone number
    await prisma.businessCustomer.update({
      where: { id: testBusinessId },
      data: {
        stripeSubscriptionId: 'sub_test_123',
        ezTextingNumberId: 'eztn_123456',
        assignedPhoneNumber: '+14045551234',
      },
    })

    // Mock successful phone release
    mockReleasePhoneNumber.mockResolvedValueOnce({
      success: true,
    })

    const webhookEvent = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          metadata: {
            businessId: testBusinessId,
          },
        },
      },
    }

    const { handleWebhook } = await import('@/lib/stripe')
    const result = await handleWebhook(JSON.stringify(webhookEvent), 'test_signature')

    expect(result.success).toBe(true)

    // Verify phone was released
    expect(mockReleasePhoneNumber).toHaveBeenCalledWith('eztn_123456')

    // Verify business was deactivated
    const updatedBusiness = await prisma.businessCustomer.findUnique({
      where: { id: testBusinessId },
    })

    expect(updatedBusiness?.isActive).toBe(false)
    expect(updatedBusiness?.subscriptionStatus).toBe('canceled')
  })
})
