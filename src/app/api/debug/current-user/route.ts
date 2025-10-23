import { NextResponse } from 'next/server'
import { getCurrentUserEmail, getCurrentUserBusinessId } from '@/lib/auth-utils.server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const email = await getCurrentUserEmail()
    const businessId = await getCurrentUserBusinessId()

    if (!email) {
      return NextResponse.json({
        error: 'No email found for current user',
        email: null,
        businessId: null,
        businessExists: false
      })
    }

    const business = await prisma.businessCustomer.findFirst({
      where: {
        contactEmail: {
          equals: email,
          mode: 'insensitive'
        }
      }
    })

    return NextResponse.json({
      email,
      businessId,
      businessExists: !!business,
      businessData: business ? {
        id: business.id,
        businessName: business.businessName,
        contactEmail: business.contactEmail,
        zipCode: business.zipCode,
        assignedPhoneNumber: business.assignedPhoneNumber,
        onboardingCompleted: business.onboardingCompleted
      } : null
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
