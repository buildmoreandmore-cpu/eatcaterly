import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

// Subscription pricing (split payment model)
const SUBSCRIPTION_PRICES = {
  starter: 3500, // $35/month (total $65 - $30 phone number)
  pro: 9500, // $95/month (total $125 - $30 phone number)
}

const PHONE_NUMBER_PRICE = 3000 // $30 one-time charge for EZ Texting phone number

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, email } = await request.json()

    // Validate plan
    if (!plan || !['starter', 'pro'].includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid plan. Must be "starter" or "pro"',
        },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      )
    }

    // Get or create business customer
    const businessCustomer = await prisma.businessCustomer.findUnique({
      where: { contactEmail: email },
    })

    if (!businessCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business profile not found. Please complete onboarding first.',
        },
        { status: 404 }
      )
    }

    // Get subscription price for the selected plan
    const subscriptionPrice = SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES]

    // Create Stripe checkout session with split payment:
    // 1. $30 one-time charge for phone number (charged immediately)
    // 2. Subscription ($35/$95) with 14-day trial
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        // Line item 1: One-time $30 charge for phone number (no trial)
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'A2P-Compliant Phone Number',
              description: 'One-time setup fee for your dedicated SMS phone number',
            },
            unit_amount: PHONE_NUMBER_PRICE,
          },
          quantity: 1,
        },
        // Line item 2: Subscription with 14-day trial
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `SMS ordering and menu management for your food business`,
            },
            unit_amount: subscriptionPrice,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: businessCustomer.id,
      metadata: {
        businessId: businessCustomer.id,
        plan: plan,
        userId: userId || '',
      },
      subscription_data: {
        metadata: {
          businessId: businessCustomer.id,
          plan: plan,
        },
        trial_period_days: 14, // 14-day free trial
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/plan?canceled=true`,
      allow_promotion_codes: true,
    })

    // Update business customer with selected plan (before payment)
    await prisma.businessCustomer.update({
      where: { id: businessCustomer.id },
      data: {
        // Store plan selection (will be activated after payment)
        subscriptionStatus: 'trial', // Will be updated to 'active' by webhook
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}
