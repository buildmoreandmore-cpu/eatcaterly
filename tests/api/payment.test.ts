import { createPaymentLink, handleWebhook } from '@/lib/stripe'

// Mock Stripe
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    paymentLinks: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  })),
}))

// Mock database
const mockPrisma = {
  order: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

describe('Stripe Payment Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createPaymentLink', () => {
    it('should create a payment link for an order', async () => {
      const mockOrder = {
        id: 'order123',
        totalAmount: 2500, // $25.00
        customer: {
          name: 'John Doe',
          phoneNumber: '+1234567890',
          email: 'john@example.com',
        },
        items: {
          item1: {
            name: 'Chicken Alfredo',
            price: 1299,
            quantity: 1,
          },
          item2: {
            name: 'Caesar Salad',
            price: 899,
            quantity: 1,
          },
        },
      }

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder)

      const mockPaymentLink = {
        id: 'plink_test123',
        url: 'https://checkout.stripe.com/pay/plink_test123',
      }

      const Stripe = require('stripe')
      const mockStripe = {
        paymentLinks: {
          create: jest.fn().mockResolvedValue(mockPaymentLink),
        },
      }
      Stripe.mockReturnValue(mockStripe)

      const result = await createPaymentLink('order123')

      expect(mockStripe.paymentLinks.create).toHaveBeenCalledWith({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Chicken Alfredo',
              },
              unit_amount: 1299,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Caesar Salad',
              },
              unit_amount: 899,
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: 'order123',
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.APP_URL}/order/order123/success`,
          },
        },
      })

      expect(result).toEqual({
        paymentLinkId: 'plink_test123',
        url: 'https://checkout.stripe.com/pay/plink_test123',
      })

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order123' },
        data: {
          paymentId: 'plink_test123',
          paymentUrl: 'https://checkout.stripe.com/pay/plink_test123',
        },
      })
    })

    it('should handle missing order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null)

      await expect(createPaymentLink('nonexistent')).rejects.toThrow('Order not found')
    })
  })

  describe('handleWebhook', () => {
    it('should handle successful payment completion', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              orderId: 'order123',
            },
            payment_status: 'paid',
            amount_total: 2500,
          },
        },
      }

      const Stripe = require('stripe')
      const mockStripe = {
        webhooks: {
          constructEvent: jest.fn().mockReturnValue(mockEvent),
        },
      }
      Stripe.mockReturnValue(mockStripe)

      const rawBody = 'raw-webhook-body'
      const signature = 'stripe-signature'

      await handleWebhook(rawBody, signature)

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order123' },
        data: {
          status: 'PAID',
        },
      })
    })

    it('should handle webhook signature verification failure', async () => {
      const Stripe = require('stripe')
      const mockStripe = {
        webhooks: {
          constructEvent: jest.fn().mockImplementation(() => {
            throw new Error('Invalid signature')
          }),
        },
      }
      Stripe.mockReturnValue(mockStripe)

      const rawBody = 'raw-webhook-body'
      const signature = 'invalid-signature'

      await expect(handleWebhook(rawBody, signature)).rejects.toThrow('Invalid signature')
    })
  })
})