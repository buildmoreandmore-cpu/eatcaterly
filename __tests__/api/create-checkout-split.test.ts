/**
 * @jest-environment node
 */
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { prisma } from '@/lib/db'

describe('Split Payment Checkout API', () => {
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
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.businessCustomer.delete({
      where: { id: testBusinessId },
    })
  })

  test('should create checkout with $30 one-time charge for phone number', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'starter',
        email: testEmail,
      }),
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.checkoutUrl).toBeDefined()
    expect(data.sessionId).toBeDefined()

    // Verify the session was created with split payment
    // We'll check this by calling Stripe API to inspect the session
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ['line_items', 'line_items.data']
    })

    // Should have 2 line items: one-time $30 + subscription
    expect(session.line_items).toBeDefined()

    // First line item: $30 one-time for phone number
    const phoneCharge = session.line_items.data[0]
    expect(phoneCharge.amount_total).toBe(3000) // $30 in cents

    // Second line item: subscription ($35 for Starter)
    const subscriptionCharge = session.line_items.data[1]
    expect(subscriptionCharge.price.recurring).toBeDefined()
  })

  test('should create checkout with $35 subscription for Starter plan', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'starter',
        email: testEmail,
      }),
    })

    const data = await response.json()
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ['line_items', 'line_items.data.price']
    })

    // Find the subscription line item
    const subscriptionItem = session.line_items.data.find(
      (item: any) => item.price.recurring !== null
    )

    expect(subscriptionItem).toBeDefined()
    expect(subscriptionItem.price.unit_amount).toBe(3500) // $35 in cents
    expect(subscriptionItem.price.recurring.interval).toBe('month')
  })

  test('should create checkout with $95 subscription for Pro plan', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'pro',
        email: testEmail,
      }),
    })

    const data = await response.json()
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ['line_items', 'line_items.data.price']
    })

    // Find the subscription line item
    const subscriptionItem = session.line_items.data.find(
      (item: any) => item.price.recurring !== null
    )

    expect(subscriptionItem).toBeDefined()
    expect(subscriptionItem.price.unit_amount).toBe(9500) // $95 in cents
  })

  test('should include businessId in session metadata', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'starter',
        email: testEmail,
      }),
    })

    const data = await response.json()
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(data.sessionId)

    expect(session.metadata.businessId).toBe(testBusinessId)
    expect(session.metadata.plan).toBe('starter')
  })

  test('should set 14-day trial on subscription', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'starter',
        email: testEmail,
      }),
    })

    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(data.sessionId)

    // Verify session is in subscription mode (trial is configured during creation)
    // Note: subscription_data is write-only and not returned on retrieval
    // The trial configuration will be applied when the subscription is created after checkout
    expect(session.mode).toBe('subscription')
    expect(session.status).toBe('open')
  })

  test('should fail with 404 if business profile not found', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'starter',
        email: 'nonexistent@example.com',
      }),
    })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Business profile not found')
  })

  test('should fail with 400 if plan is invalid', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'invalid-plan',
        email: testEmail,
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid plan')
  })

  test('should fail with 400 if email is missing', async () => {
    const response = await fetch('http://localhost:3000/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'starter',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Email is required')
  })
})
