import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json()

    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'accountId is required',
        },
        { status: 400 }
      )
    }

    // Verify account exists in database
    const businessCustomer = await prisma.businessCustomer.findFirst({
      where: { stripeConnectAccountId: accountId },
    })

    if (!businessCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business not found for this Stripe account',
        },
        { status: 404 }
      )
    }

    // Create new account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/stripe-connect?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/stripe-connect?return=true&account_id=${accountId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
    })
  } catch (error: any) {
    console.error('Stripe Connect refresh onboarding error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to refresh onboarding link',
      },
      { status: 500 }
    )
  }
}
