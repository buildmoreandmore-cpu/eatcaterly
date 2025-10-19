/**
 * Tests for Stripe Connect Payment Routing
 * Testing destination charges and platform fee collection
 */

import { prisma } from '@/lib/db'
import {
  createPaymentLink,
  calculatePlatformFee,
  validateBusinessPaymentReady,
  getBusinessFromOrder
} from '@/lib/stripe'

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentLinks: {
      create: jest.fn().mockResolvedValue({
        id: 'plink_test_123',
        url: 'https://pay.stripe.com/test',
      }),
    },
  }))
})

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    businessCustomer: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

describe('Stripe Connect Payment Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculatePlatformFee', () => {
    it('should calculate 2% platform fee correctly', () => {
      expect(calculatePlatformFee(10000)).toBe(200) // $100 order = $2 fee
      expect(calculatePlatformFee(5000)).toBe(100)  // $50 order = $1 fee
      expect(calculatePlatformFee(2500)).toBe(50)   // $25 order = $0.50 fee
    })

    it('should round to nearest cent', () => {
      expect(calculatePlatformFee(1234)).toBe(25)   // $12.34 order = $0.25 fee (rounded)
      expect(calculatePlatformFee(1235)).toBe(25)   // $12.35 order = $0.25 fee (rounded)
    })

    it('should handle zero amount', () => {
      expect(calculatePlatformFee(0)).toBe(0)
    })

    it('should handle minimum amounts', () => {
      expect(calculatePlatformFee(100)).toBe(2)     // $1 order = $0.02 fee
      expect(calculatePlatformFee(50)).toBe(1)      // $0.50 order = $0.01 fee
    })
  })

  describe('validateBusinessPaymentReady', () => {
    it('should return true for fully onboarded business', async () => {
      const mockBusiness = {
        id: 'biz_123',
        stripeConnectAccountId: 'acct_123',
        stripeOnboardingComplete: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
      }

      ;(prisma.businessCustomer.findUnique as jest.Mock).mockResolvedValue(mockBusiness)

      const result = await validateBusinessPaymentReady('biz_123')
      expect(result.isReady).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return false if onboarding not complete', async () => {
      const mockBusiness = {
        id: 'biz_123',
        stripeConnectAccountId: 'acct_123',
        stripeOnboardingComplete: false,
        stripeChargesEnabled: false,
      }

      ;(prisma.businessCustomer.findUnique as jest.Mock).mockResolvedValue(mockBusiness)

      const result = await validateBusinessPaymentReady('biz_123')
      expect(result.isReady).toBe(false)
      expect(result.error).toContain('onboarding')
    })

    it('should return false if no Stripe Connect account', async () => {
      const mockBusiness = {
        id: 'biz_123',
        stripeConnectAccountId: null,
      }

      ;(prisma.businessCustomer.findUnique as jest.Mock).mockResolvedValue(mockBusiness)

      const result = await validateBusinessPaymentReady('biz_123')
      expect(result.isReady).toBe(false)
      expect(result.error).toContain('Stripe account')
    })

    it('should return false if charges not enabled', async () => {
      const mockBusiness = {
        id: 'biz_123',
        stripeConnectAccountId: 'acct_123',
        stripeOnboardingComplete: true,
        stripeChargesEnabled: false,
      }

      ;(prisma.businessCustomer.findUnique as jest.Mock).mockResolvedValue(mockBusiness)

      const result = await validateBusinessPaymentReady('biz_123')
      expect(result.isReady).toBe(false)
      expect(result.error).toContain('charges')
    })

    it('should return false if business not found', async () => {
      ;(prisma.businessCustomer.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await validateBusinessPaymentReady('biz_123')
      expect(result.isReady).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('getBusinessFromOrder', () => {
    it('should retrieve business from order', async () => {
      const mockOrder = {
        id: 'order_123',
        businessId: 'biz_123',
        businessCustomer: {
          id: 'biz_123',
          stripeConnectAccountId: 'acct_123',
        },
      }

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      const business = await getBusinessFromOrder('order_123')
      expect(business).toBeDefined()
      expect(business?.stripeConnectAccountId).toBe('acct_123')
    })

    it('should return null if order not found', async () => {
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

      const business = await getBusinessFromOrder('order_123')
      expect(business).toBeNull()
    })

    it('should return null if order has no business relation', async () => {
      const mockOrder = {
        id: 'order_123',
        businessId: 'biz_123',
        businessCustomer: null,
      }

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      const business = await getBusinessFromOrder('order_123')
      expect(business).toBeNull()
    })
  })

  describe('createPaymentLink with destination charges', () => {
    it('should create payment link on business Stripe Connect account', async () => {
      const mockOrder = {
        id: 'order_123',
        businessId: 'biz_123',
        customerId: 'cust_123',
        totalAmount: 10000, // $100
        items: {
          item1: { name: 'Pizza', price: 10000, quantity: 1 },
        },
        customer: {
          id: 'cust_123',
          phoneNumber: '+1234567890',
        },
        businessCustomer: {
          id: 'biz_123',
          stripeConnectAccountId: 'acct_business_123',
          stripeOnboardingComplete: true,
          stripeChargesEnabled: true,
          stripePayoutsEnabled: true,
        },
      }

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
      ;(prisma.order.update as jest.Mock).mockResolvedValue(mockOrder)

      const Stripe = require('stripe')
      const mockStripeInstance = new Stripe()

      const result = await createPaymentLink('order_123')

      // Verify payment link was created with correct parameters
      expect(mockStripeInstance.paymentLinks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.any(Array),
          metadata: expect.objectContaining({
            orderId: 'order_123',
          }),
          application_fee_amount: 200, // 2% of $100 = $2
        }),
        expect.objectContaining({
          stripeAccount: 'acct_business_123', // Business's Connect account
        })
      )

      expect(result.paymentLinkId).toBe('plink_test_123')
      expect(result.url).toBe('https://pay.stripe.com/test')
    })

    it('should throw error if business not ready for payments', async () => {
      const mockOrder = {
        id: 'order_123',
        businessId: 'biz_123',
        totalAmount: 10000,
        businessCustomer: {
          id: 'biz_123',
          stripeConnectAccountId: 'acct_123',
          stripeOnboardingComplete: false, // Not ready
        },
      }

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      await expect(createPaymentLink('order_123')).rejects.toThrow('onboarding')
    })

    it('should throw error if business has no Stripe Connect account', async () => {
      const mockOrder = {
        id: 'order_123',
        businessId: 'biz_123',
        totalAmount: 10000,
        businessCustomer: {
          id: 'biz_123',
          stripeConnectAccountId: null, // No account
        },
      }

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      await expect(createPaymentLink('order_123')).rejects.toThrow('Stripe account')
    })

    it('should update order with payment info and platform fee', async () => {
      const mockOrder = {
        id: 'order_123',
        businessId: 'biz_123',
        customerId: 'cust_123',
        totalAmount: 5000, // $50
        items: {
          item1: { name: 'Burger', price: 5000, quantity: 1 },
        },
        customer: {
          id: 'cust_123',
          phoneNumber: '+1234567890',
        },
        businessCustomer: {
          id: 'biz_123',
          stripeConnectAccountId: 'acct_business_123',
          stripeOnboardingComplete: true,
          stripeChargesEnabled: true,
        },
      }

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
      ;(prisma.order.update as jest.Mock).mockResolvedValue(mockOrder)

      await createPaymentLink('order_123')

      // Verify order was updated with payment info and fee
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order_123' },
        data: expect.objectContaining({
          paymentId: 'plink_test_123',
          paymentUrl: 'https://pay.stripe.com/test',
          platformFee: 100, // 2% of $50 = $1
          status: 'CONFIRMED',
        }),
      })
    })
  })
})
