import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/auth-utils.server'

export async function POST(req: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find the user
    const business = await prisma.businessCustomer.findUnique({
      where: { contactEmail: email }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if they have a Stripe subscription
    const hasStripeSubscription = !!(business.stripeCustomerId && business.stripeSubscriptionId)

    // If they have Stripe setup, mark onboarding as complete
    if (hasStripeSubscription && !business.onboardingCompleted) {
      await prisma.businessCustomer.update({
        where: { id: business.id },
        data: {
          onboardingCompleted: true,
          subscriptionStatus: business.subscriptionStatus || 'active'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'User fixed - onboarding marked as complete',
        business: {
          email: business.contactEmail,
          onboardingCompleted: true,
          subscriptionStatus: business.subscriptionStatus || 'active'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User already has correct settings',
      business: {
        email: business.contactEmail,
        onboardingCompleted: business.onboardingCompleted,
        hasStripe: hasStripeSubscription,
        subscriptionStatus: business.subscriptionStatus
      }
    })

  } catch (error: any) {
    console.error('Error fixing user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const url = new URL(req.url)
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    const business = await prisma.businessCustomer.findUnique({
      where: { contactEmail: email },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        onboardingCompleted: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        assignedPhoneNumber: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({ business })

  } catch (error: any) {
    console.error('Error checking user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
