import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      )
    }

    // Find business customer by email
    const businessCustomer = await prisma.businessCustomer.findUnique({
      where: { contactEmail: email },
    })

    if (!businessCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business profile not found. Please complete business onboarding first.',
        },
        { status: 404 }
      )
    }

    // Check if they already have a Stripe Connect account
    if (businessCustomer.stripeConnectAccountId) {
      // Return existing account's onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: businessCustomer.stripeConnectAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/stripe-connect?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/stripe-connect?return=true&account_id=${businessCustomer.stripeConnectAccountId}`,
        type: 'account_onboarding',
      })

      return NextResponse.json({
        success: true,
        accountId: businessCustomer.stripeConnectAccountId,
        onboardingUrl: accountLink.url,
        existing: true,
      })
    }

    // Create new Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'company',
      metadata: {
        businessId: businessCustomer.id,
        businessName: businessCustomer.businessName,
      },
    })

    // Update business customer with Stripe account ID
    await prisma.businessCustomer.update({
      where: { id: businessCustomer.id },
      data: {
        stripeConnectAccountId: account.id,
        stripeAccountStatus: 'pending',
        stripeOnboardingComplete: false,
      },
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/stripe-connect?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/stripe-connect?return=true&account_id=${account.id}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    })
  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Stripe Connect account',
      },
      { status: 500 }
    )
  }
}
