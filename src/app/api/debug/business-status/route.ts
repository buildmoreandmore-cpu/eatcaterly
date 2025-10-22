import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserEmail, getCurrentUserBusinessId } from '@/lib/auth-utils.server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userEmail = await getCurrentUserEmail()
    const businessId = await getCurrentUserBusinessId()

    if (!userEmail) {
      return NextResponse.json({
        error: 'Not logged in',
        userEmail: null,
        businessId: null,
        businessRecord: null
      })
    }

    // Try to find business by email
    const businessRecord = await prisma.businessCustomer.findFirst({
      where: {
        contactEmail: {
          equals: userEmail,
          mode: 'insensitive'
        }
      }
    })

    return NextResponse.json({
      userEmail,
      businessId,
      businessRecord: businessRecord ? {
        id: businessRecord.id,
        businessName: businessRecord.businessName,
        contactEmail: businessRecord.contactEmail,
        onboardingCompleted: businessRecord.onboardingCompleted,
        subscriptionStatus: businessRecord.subscriptionStatus,
        subscriptionTier: businessRecord.subscriptionTier,
        assignedPhoneNumber: businessRecord.assignedPhoneNumber
      } : null,
      diagnosis: businessRecord
        ? 'Business record found'
        : 'No business record found - user needs to complete onboarding'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
