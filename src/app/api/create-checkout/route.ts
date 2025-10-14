import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

// Stripe Price IDs (create these in Stripe Dashboard)
const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter_test', // $65/month
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_test', // $125/month
}

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

    // Get price ID for the selected plan
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
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
