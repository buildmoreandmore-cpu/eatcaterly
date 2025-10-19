/**
 * @jest-environment node
 */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

// Mock Stripe
const mockRetrieveSubscription = jest.fn()
const mockListInvoices = jest.fn()
const mockCancelSubscription = jest.fn()

jest.mock('stripe', () => {
  return {
    __esModule: true,
    default: class MockStripe {
      subscriptions = {
        retrieve: mockRetrieveSubscription,
        cancel: mockCancelSubscription,
      }
      invoices = {
        list: mockListInvoices,
      }
    },
  }
})

// Mock EZ Texting
const mockReleasePhoneNumber = jest.fn()

jest.mock('@/lib/ez-texting', () => {
  return {
    __esModule: true,
    default: {
      releasePhoneNumber: mockReleasePhoneNumber,
    },
  }
})

describe('Business Account APIs', () => {
  let testBusinessId: string
  let testEmail: string

  beforeEach(async () => {
    testEmail = `test-${Date.now()}@example.com`
    const business = await prisma.businessCustomer.create({
      data: {
        businessName: 'Test Pizza Shop',
        contactName: 'Test User',
        contactEmail: testEmail,
        zipCode: '30309',
        assignedPhoneNumber: '+14045551234',
        areaCode: '404',
        city: 'Atlanta',
        state: 'GA',
        isActive: true,
        onboardingCompleted: true,
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
        ezTextingNumberId: 'eztn_123456',
        subscriptionStatus: 'active',
      },
    })
    testBusinessId = business.id

    // Clear mocks
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await prisma.businessCustomer.delete({
      where: { id: testBusinessId },
    })
  })

  describe('GET /api/business/subscription', () => {
    test('should return subscription details with phone number and billing info', async () => {
      // Mock Stripe subscription response
      mockRetrieveSubscription.mockResolvedValueOnce({
        id: 'sub_test_123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
        trial_end: null,
        items: {
          data: [
            {
              price: {
                id: 'price_phone_30',
                unit_amount: 3000, // $30
                nickname: 'Phone Number',
                recurring: { interval: 'month' },
              },
            },
            {
              price: {
                id: 'price_starter_35',
                unit_amount: 3500, // $35
                nickname: 'Starter Plan',
                recurring: { interval: 'month' },
              },
            },
          ],
        },
      })

      const { getSubscriptionDetails } = await import('@/lib/business-account')
      const result = await getSubscriptionDetails(testBusinessId)

      expect(result.success).toBe(true)
      expect(result.phoneNumber).toBe('+14045551234')
      expect(result.subscriptionStatus).toBe('active')
      expect(result.items).toHaveLength(2)
      expect(result.items[0].description).toBe('Phone Number')
      expect(result.items[0].amount).toBe(30)
      expect(result.items[1].description).toBe('Starter Plan')
      expect(result.items[1].amount).toBe(35)
      expect(result.totalMonthly).toBe(65)
      expect(result.nextBillingDate).toBeDefined()
      expect(mockRetrieveSubscription).toHaveBeenCalledWith('sub_test_123')
    })

    test('should return trial information when in trial period', async () => {
      const trialEndTimestamp = Math.floor(Date.now() / 1000) + 86400 * 14 // 14 days from now

      mockRetrieveSubscription.mockResolvedValueOnce({
        id: 'sub_test_123',
        status: 'trialing',
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
        trial_end: trialEndTimestamp,
        items: {
          data: [
            {
              price: {
                id: 'price_phone_30',
                unit_amount: 3000,
                nickname: 'Phone Number',
                recurring: { interval: 'month' },
              },
            },
            {
              price: {
                id: 'price_starter_35',
                unit_amount: 3500,
                nickname: 'Starter Plan',
                recurring: { interval: 'month' },
              },
            },
          ],
        },
      })

      const { getSubscriptionDetails } = await import('@/lib/business-account')
      const result = await getSubscriptionDetails(testBusinessId)

      expect(result.success).toBe(true)
      expect(result.subscriptionStatus).toBe('trialing')
      expect(result.trialEnd).toBeDefined()
      expect(result.trialDaysRemaining).toBeGreaterThan(0)
    })

    test('should handle business not found', async () => {
      const { getSubscriptionDetails } = await import('@/lib/business-account')
      const result = await getSubscriptionDetails('nonexistent_id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    test('should handle business without subscription', async () => {
      // Create business without subscription
      const timestamp = Date.now()
      const businessWithoutSub = await prisma.businessCustomer.create({
        data: {
          businessName: 'No Sub Shop',
          contactName: 'No Sub User',
          contactEmail: `no-sub-${timestamp}@example.com`,
          zipCode: '30309',
          assignedPhoneNumber: `+1404555${timestamp.toString().slice(-4)}`,
          areaCode: '404',
          city: 'Atlanta',
          state: 'GA',
          isActive: true,
          onboardingCompleted: false,
        },
      })

      const { getSubscriptionDetails } = await import('@/lib/business-account')
      const result = await getSubscriptionDetails(businessWithoutSub.id)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No active subscription')

      // Cleanup
      await prisma.businessCustomer.delete({
        where: { id: businessWithoutSub.id },
      })
    })
  })

  describe('GET /api/business/invoices', () => {
    test('should return list of invoices with download links', async () => {
      mockListInvoices.mockResolvedValueOnce({
        data: [
          {
            id: 'in_test_1',
            number: 'INV-001',
            amount_paid: 6500, // $65
            status: 'paid',
            created: Math.floor(Date.now() / 1000) - 86400 * 30,
            invoice_pdf: 'https://stripe.com/invoice/pdf/inv_test_1',
            hosted_invoice_url: 'https://stripe.com/invoice/inv_test_1',
          },
          {
            id: 'in_test_2',
            number: 'INV-002',
            amount_paid: 6500,
            status: 'paid',
            created: Math.floor(Date.now() / 1000) - 86400 * 60,
            invoice_pdf: 'https://stripe.com/invoice/pdf/inv_test_2',
            hosted_invoice_url: 'https://stripe.com/invoice/inv_test_2',
          },
        ],
      })

      const { getInvoices } = await import('@/lib/business-account')
      const result = await getInvoices(testBusinessId)

      expect(result.success).toBe(true)
      expect(result.invoices).toHaveLength(2)
      expect(result.invoices[0].id).toBe('in_test_1')
      expect(result.invoices[0].number).toBe('INV-001')
      expect(result.invoices[0].amount).toBe(65)
      expect(result.invoices[0].status).toBe('paid')
      expect(result.invoices[0].pdfUrl).toBe('https://stripe.com/invoice/pdf/inv_test_1')
      expect(result.invoices[0].hostedUrl).toBe('https://stripe.com/invoice/inv_test_1')
      expect(result.invoices[0].date).toBeDefined()
      expect(mockListInvoices).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        limit: 12,
      })
    })

    test('should handle empty invoice list', async () => {
      mockListInvoices.mockResolvedValueOnce({
        data: [],
      })

      const { getInvoices } = await import('@/lib/business-account')
      const result = await getInvoices(testBusinessId)

      expect(result.success).toBe(true)
      expect(result.invoices).toHaveLength(0)
    })

    test('should handle business not found', async () => {
      const { getInvoices } = await import('@/lib/business-account')
      const result = await getInvoices('nonexistent_id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('POST /api/business/cancel', () => {
    test('should cancel subscription and release phone number', async () => {
      // Mock successful subscription cancellation
      mockCancelSubscription.mockResolvedValueOnce({
        id: 'sub_test_123',
        status: 'canceled',
      })

      // Mock successful phone release
      mockReleasePhoneNumber.mockResolvedValueOnce({
        success: true,
      })

      const { cancelSubscription } = await import('@/lib/business-account')
      const result = await cancelSubscription(testBusinessId)

      expect(result.success).toBe(true)
      expect(result.message).toContain('canceled')
      expect(mockCancelSubscription).toHaveBeenCalledWith('sub_test_123')
      expect(mockReleasePhoneNumber).toHaveBeenCalledWith('eztn_123456')

      // Verify database was updated
      const updatedBusiness = await prisma.businessCustomer.findUnique({
        where: { id: testBusinessId },
      })

      expect(updatedBusiness?.isActive).toBe(false)
      expect(updatedBusiness?.subscriptionStatus).toBe('canceled')
    })

    test('should handle business not found', async () => {
      const { cancelSubscription } = await import('@/lib/business-account')
      const result = await cancelSubscription('nonexistent_id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    test('should handle business without subscription', async () => {
      // Create business without subscription
      const timestamp = Date.now()
      const businessWithoutSub = await prisma.businessCustomer.create({
        data: {
          businessName: 'No Sub Shop',
          contactName: 'No Sub User',
          contactEmail: `no-sub-cancel-${timestamp}@example.com`,
          zipCode: '30309',
          assignedPhoneNumber: `+1404556${timestamp.toString().slice(-4)}`,
          areaCode: '404',
          city: 'Atlanta',
          state: 'GA',
          isActive: true,
          onboardingCompleted: false,
        },
      })

      const { cancelSubscription } = await import('@/lib/business-account')
      const result = await cancelSubscription(businessWithoutSub.id)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No active subscription')

      // Cleanup
      await prisma.businessCustomer.delete({
        where: { id: businessWithoutSub.id },
      })
    })

    test('should still deactivate business even if phone release fails', async () => {
      // Mock subscription cancellation success
      mockCancelSubscription.mockResolvedValueOnce({
        id: 'sub_test_123',
        status: 'canceled',
      })

      // Mock phone release failure
      mockReleasePhoneNumber.mockResolvedValueOnce({
        success: false,
        error: 'Phone number not found',
      })

      const { cancelSubscription } = await import('@/lib/business-account')
      const result = await cancelSubscription(testBusinessId)

      expect(result.success).toBe(true)
      expect(result.message).toContain('canceled')

      // Verify business was still deactivated
      const updatedBusiness = await prisma.businessCustomer.findUnique({
        where: { id: testBusinessId },
      })

      expect(updatedBusiness?.isActive).toBe(false)
      expect(updatedBusiness?.subscriptionStatus).toBe('canceled')
    })
  })
})
