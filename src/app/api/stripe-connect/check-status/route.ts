import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'accountId is required',
        },
        { status: 400 }
      )
    }

    // Find business customer with this Stripe account
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

    // Retrieve account from Stripe
    const account = await stripe.accounts.retrieve(accountId)

    const chargesEnabled = account.charges_enabled || false
    const payoutsEnabled = account.payouts_enabled || false
    const detailsSubmitted = account.details_submitted || false
    const onboardingComplete = chargesEnabled && payoutsEnabled && detailsSubmitted

    // Update database with current status
    await prisma.businessCustomer.update({
      where: { id: businessCustomer.id },
      data: {
        stripeOnboardingComplete: onboardingComplete,
        stripeChargesEnabled: chargesEnabled,
        stripePayoutsEnabled: payoutsEnabled,
        stripeDetailsSubmitted: detailsSubmitted,
        stripeAccountStatus: account.capabilities?.card_payments?.toString() || 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      accountId: account.id,
      onboardingComplete,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    })
  } catch (error: any) {
    console.error('Stripe Connect status check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check Stripe account status',
      },
      { status: 500 }
    )
  }
}
