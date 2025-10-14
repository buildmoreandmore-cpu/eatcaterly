import { NextRequest } from 'next/server'
import { GET } from './route'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    businessCustomer: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    accounts: {
      retrieve: jest.fn(),
    },
  }))
})

describe('GET /api/stripe-connect/check-status', () => {
  let mockStripe: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockStripe = new Stripe('test_key', { apiVersion: '2025-08-27.basil' })
  })

  it('returns error if accountId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe-connect/check-status')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('accountId')
  })

  it('returns error if business customer not found', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/stripe-connect/check-status?accountId=acct_123'
    )

    ;(prisma.businessCustomer.findFirst as jest.Mock).mockResolvedValue(null)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Business not found')
  })

  it('returns onboarding complete status for fully verified account', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/stripe-connect/check-status?accountId=acct_123'
    )

    ;(prisma.businessCustomer.findFirst as jest.Mock).mockResolvedValue({
      id: 'biz_123',
      stripeConnectAccountId: 'acct_123',
    })

    mockStripe.accounts.retrieve.mockResolvedValue({
      id: 'acct_123',
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    })

    ;(prisma.businessCustomer.update as jest.Mock).mockResolvedValue({
      id: 'biz_123',
      stripeOnboardingComplete: true,
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.onboardingComplete).toBe(true)
    expect(data.chargesEnabled).toBe(true)
    expect(data.payoutsEnabled).toBe(true)
  })

  it('returns incomplete status if charges not enabled', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/stripe-connect/check-status?accountId=acct_123'
    )

    ;(prisma.businessCustomer.findFirst as jest.Mock).mockResolvedValue({
      id: 'biz_123',
      stripeConnectAccountId: 'acct_123',
    })

    mockStripe.accounts.retrieve.mockResolvedValue({
      id: 'acct_123',
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.onboardingComplete).toBe(false)
    expect(data.chargesEnabled).toBe(false)
    expect(data.payoutsEnabled).toBe(false)
  })

  it('updates database with onboarding completion status', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/stripe-connect/check-status?accountId=acct_123'
    )

    ;(prisma.businessCustomer.findFirst as jest.Mock).mockResolvedValue({
      id: 'biz_123',
      stripeConnectAccountId: 'acct_123',
    })

    mockStripe.accounts.retrieve.mockResolvedValue({
      id: 'acct_123',
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    })

    await GET(request)

    expect(prisma.businessCustomer.update).toHaveBeenCalledWith({
      where: { id: 'biz_123' },
      data: expect.objectContaining({
        stripeOnboardingComplete: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
        stripeDetailsSubmitted: true,
      }),
    })
  })

  it('handles Stripe API errors gracefully', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/stripe-connect/check-status?accountId=acct_123'
    )

    ;(prisma.businessCustomer.findFirst as jest.Mock).mockResolvedValue({
      id: 'biz_123',
      stripeConnectAccountId: 'acct_123',
    })

    mockStripe.accounts.retrieve.mockRejectedValue(new Error('Stripe API error'))

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Failed')
  })
})
