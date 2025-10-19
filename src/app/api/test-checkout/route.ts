import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter_test',
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_test',
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()

    // Validate plan
    if (!plan || !['starter', 'pro'].includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid plan',
        },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]

    // Create Stripe checkout session WITHOUT database check
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: 'test@example.com',
      client_reference_id: 'test-customer-id',
      metadata: {
        businessId: 'test-business-id',
        plan: plan,
      },
      subscription_data: {
        metadata: {
          businessId: 'test-business-id',
          plan: plan,
        },
        trial_period_days: 14,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/plan?canceled=true`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Test checkout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}
