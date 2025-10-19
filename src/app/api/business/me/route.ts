import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/business/me?email=user@example.com
 * Get business details by email
 */
export async function GET(request: NextRequest) {
  try {
    // Get email from query parameter
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Look up the business by email
    const business = await prisma.businessCustomer.findUnique({
      where: {
        contactEmail: email,
      },
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'No business found for this email' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      businessId: business.id,
      businessName: business.businessName,
      contactEmail: business.contactEmail,
      phoneNumber: business.assignedPhoneNumber,
      subscriptionStatus: business.subscriptionStatus,
      onboardingCompleted: business.onboardingCompleted,
    })
  } catch (error: any) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch business details' },
      { status: 500 }
    )
  }
}
