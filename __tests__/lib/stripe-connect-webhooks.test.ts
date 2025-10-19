/**
 * Tests for Stripe Connect Webhook Handling
 * Testing connected account payment events and platform fee tracking
 */

import { handleWebhook } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

// Mock Stripe
jest.mock('stripe')

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    businessCustomer: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Stripe Connect Webhook Handling', () => {
  let mockStripe: jest.Mocked<Stripe>

  beforeEach(() => {
    jest.clearAllMocks()
    mockStripe = {
      webhooks: {
        constructEvent: jest.fn(),
      },
    } as any
    ;(Stripe as unknown as jest.Mock).mockReturnValue(mockStripe)
  })

  describe('Payment Success on Connected Account', () => {
    it('should handle checkout.session.completed with connected account', async () => {
      const mockSession: Partial<Stripe.Checkout.Session> = {
        id: 'cs_test_123',
        payment_status: 'paid',
        metadata: {
          orderId: 'order_123',
        },
        amount_total: 10000, // $100
      }

      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: mockSession,
        },
        account: 'acct_business_123', // Connected account ID
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_123',
        businessId: 'biz_123',
        totalAmount: 10000,
      })

      ;(prisma.order.update as jest.Mock).mockResolvedValue({})

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order_123' },
        data: {
          status: 'PAID',
        },
      })
    })

    it('should handle payment_intent.succeeded on connected account', async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 10000,
        metadata: {
          orderId: 'order_123',
        },
      }

      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: mockPaymentIntent,
        },
        account: 'acct_business_123',
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_123',
        businessId: 'biz_123',
      })

      ;(prisma.order.update as jest.Mock).mockResolvedValue({})

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order_123' },
        data: {
          status: 'PAID',
        },
      })
    })
  })

  describe('Platform Fee Tracking', () => {
    it('should track application fee creation', async () => {
      const mockApplicationFee: Partial<Stripe.ApplicationFee> = {
        id: 'fee_test_123',
        amount: 200, // $2.00 platform fee
        charge: 'ch_test_123',
        account: 'acct_business_123',
      }

      const mockEvent = {
        type: 'application_fee.created',
        data: {
          object: mockApplicationFee,
        },
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
      expect(result.message).toContain('application fee')
    })

    it('should handle application fee refund', async () => {
      const mockFeeRefund = {
        id: 'fr_test_123',
        amount: 200,
        fee: 'fee_test_123',
      }

      const mockEvent = {
        type: 'application_fee.refunded',
        data: {
          object: mockFeeRefund,
        },
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
    })
  })

  describe('Payment Failures on Connected Account', () => {
    it('should handle payment_intent.payment_failed', async () => {
      const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
        id: 'pi_test_123',
        status: 'requires_payment_method',
        last_payment_error: {
          message: 'Card declined',
        } as any,
        metadata: {
          orderId: 'order_123',
        },
      }

      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: mockPaymentIntent,
        },
        account: 'acct_business_123',
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_123',
      })

      ;(prisma.order.update as jest.Mock).mockResolvedValue({})

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order_123' },
        data: {
          status: 'CANCELLED',
        },
      })
    })

    it('should handle charge.failed on connected account', async () => {
      const mockCharge: Partial<Stripe.Charge> = {
        id: 'ch_test_123',
        status: 'failed',
        failure_message: 'Insufficient funds',
        metadata: {
          orderId: 'order_123',
        },
      }

      const mockEvent = {
        type: 'charge.failed',
        data: {
          object: mockCharge,
        },
        account: 'acct_business_123',
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_123',
      })

      ;(prisma.order.update as jest.Mock).mockResolvedValue({})

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order_123' },
        data: expect.objectContaining({
          status: 'CANCELLED',
        }),
      })
    })
  })

  describe('Connected Account Events', () => {
    it('should handle account.updated for business account changes', async () => {
      const mockAccount: Partial<Stripe.Account> = {
        id: 'acct_business_123',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      }

      const mockEvent = {
        type: 'account.updated',
        data: {
          object: mockAccount,
        },
        account: 'acct_business_123',
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      ;(prisma.businessCustomer.findFirst as jest.Mock).mockResolvedValue({
        id: 'biz_123',
        stripeConnectAccountId: 'acct_business_123',
      })

      ;(prisma.businessCustomer.update as jest.Mock).mockResolvedValue({})

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
      expect(prisma.businessCustomer.update).toHaveBeenCalledWith({
        where: { id: 'biz_123' },
        data: expect.objectContaining({
          stripeChargesEnabled: true,
          stripePayoutsEnabled: true,
          stripeOnboardingComplete: true,
        }),
      })
    })

    it('should handle account.external_account.created', async () => {
      const mockExternalAccount = {
        id: 'ba_test_123',
        object: 'bank_account',
        account: 'acct_business_123',
      }

      const mockEvent = {
        type: 'account.external_account.created',
        data: {
          object: mockExternalAccount,
        },
        account: 'acct_business_123',
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      const result = await handleWebhook('raw_body', 'signature')

      expect(result.success).toBe(true)
    })
  })

  describe('Webhook Security', () => {
    it('should reject webhook with invalid signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      await expect(handleWebhook('raw_body', 'bad_signature')).rejects.toThrow('Invalid signature')
    })

    it('should reject webhook with missing signature', async () => {
      await expect(handleWebhook('raw_body', '')).rejects.toThrow()
    })

    it('should handle webhook timeout gracefully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { orderId: 'order_123' },
            payment_status: 'paid',
          },
        },
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      // Simulate database timeout
      ;(prisma.order.findUnique as jest.Mock).mockRejectedValue(new Error('Connection timeout'))

      // Webhook should still acknowledge receipt
      await expect(handleWebhook('raw_body', 'signature')).rejects.toThrow('Connection timeout')
    })
  })

  describe('Idempotency', () => {
    it('should handle duplicate webhook events gracefully', async () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            metadata: { orderId: 'order_123' },
          },
        },
      } as Stripe.Event

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order_123',
        status: 'PAID', // Already paid
      })

      ;(prisma.order.update as jest.Mock).mockResolvedValue({})

      // First webhook
      const result1 = await handleWebhook('raw_body', 'signature')
      expect(result1.success).toBe(true)

      // Duplicate webhook - should not error
      const result2 = await handleWebhook('raw_body', 'signature')
      expect(result2.success).toBe(true)
    })
  })
})
