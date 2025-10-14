import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { assignPhoneNumberForZipCode } from '@/lib/phone-number-assignment'

export async function POST(request: NextRequest) {
  try {
    const { zipCode, businessName, contactEmail, contactName, clerkUserId } = await request.json()

    // Validate required fields
    if (!zipCode || !businessName || !contactEmail || !contactName) {
      return NextResponse.json(
        {
          success: false,
          error: 'All fields are required: zip code, business name, contact email, and contact name'
        },
        { status: 400 }
      )
    }

    // Validate zip code format (5 digits)
    const zipRegex = /^\d{5}$/
    if (!zipRegex.test(zipCode)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid 5-digit zip code'
        },
        { status: 400 }
      )
    }

    // Check if customer already exists with this email
    const existingCustomer = await prisma.businessCustomer.findUnique({
      where: { contactEmail }
    })

    if (existingCustomer) {
      // If they already have a phone number assigned, return it
      if (existingCustomer.assignedPhoneNumber) {
        return NextResponse.json({
          success: true,
          data: {
            businessId: existingCustomer.id,
            businessName: existingCustomer.businessName,
            assignedPhoneNumber: existingCustomer.assignedPhoneNumber,
            areaCode: existingCustomer.areaCode,
            location: {
              city: existingCustomer.city,
              state: existingCustomer.state,
            }
          }
        })
      }
    }

    // Assign phone number based on zip code
    const assignment = await assignPhoneNumberForZipCode(zipCode)

    if (!assignment.success) {
      return NextResponse.json(
        {
          success: false,
          error: assignment.error
        },
        { status: 400 }
      )
    }

    // Create or update business customer record
    const businessCustomer = existingCustomer
      ? await prisma.businessCustomer.update({
          where: { id: existingCustomer.id },
          data: {
            businessName,
            contactName,
            zipCode,
            assignedPhoneNumber: assignment.phoneNumber!,
            areaCode: assignment.areaCode!,
            city: assignment.location?.city,
            state: assignment.location?.state,
            onboardingCompleted: false,
            isActive: true,
          }
        })
      : await prisma.businessCustomer.create({
          data: {
            businessName,
            contactName,
            contactEmail,
            zipCode,
            assignedPhoneNumber: assignment.phoneNumber!,
            areaCode: assignment.areaCode!,
            city: assignment.location?.city,
            state: assignment.location?.state,
            onboardingCompleted: false,
            isActive: true,
          }
        })

    // TODO: Send welcome email with phone number details
    console.log(`Welcome email would be sent to ${contactEmail}`)

    return NextResponse.json({
      success: true,
      data: {
        businessId: businessCustomer.id,
        businessName: businessCustomer.businessName,
        assignedPhoneNumber: assignment.phoneNumber,
        areaCode: assignment.areaCode,
        location: assignment.location,
        message: `Success! Your local SMS number ${assignment.phoneNumber} has been assigned for ${assignment.location?.city}, ${assignment.location?.state}`
      }
    })

  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to complete onboarding'
      },
      { status: 500 }
    )
  }
}
