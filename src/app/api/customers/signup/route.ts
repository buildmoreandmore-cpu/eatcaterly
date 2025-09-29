import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { assignPhoneNumberForZipCode } from '@/lib/phone-number-assignment'

export async function POST(request: NextRequest) {
  try {
    const { zipCode, businessName, contactEmail, contactName } = await request.json()

    if (!zipCode || !businessName || !contactEmail || !contactName) {
      return NextResponse.json(
        { error: 'Zip code, business name, contact email, and contact name are required' },
        { status: 400 }
      )
    }

    // Validate zip code format (5 digits)
    const zipRegex = /^\d{5}$/
    if (!zipRegex.test(zipCode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 5-digit zip code' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await prisma.businessCustomer.findUnique({
      where: { contactEmail }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'A business is already registered with this email address' },
        { status: 409 }
      )
    }

    // Assign phone number based on zip code
    const assignment = await assignPhoneNumberForZipCode(zipCode)

    if (!assignment.success) {
      return NextResponse.json(
        { error: assignment.error },
        { status: 400 }
      )
    }

    // Create business customer record
    const businessCustomer = await prisma.businessCustomer.create({
      data: {
        businessName,
        contactName,
        contactEmail,
        zipCode,
        assignedPhoneNumber: assignment.phoneNumber!,
        areaCode: assignment.areaCode!,
        city: assignment.location?.city,
        state: assignment.location?.state,
        isActive: true,
        onboardingCompleted: false
      }
    })

    // Send welcome email (placeholder)
    console.log(`Welcome email would be sent to ${contactEmail}`)

    return NextResponse.json({
      success: true,
      data: {
        businessId: businessCustomer.id,
        businessName: businessCustomer.businessName,
        assignedPhoneNumber: assignment.phoneNumber,
        areaCode: assignment.areaCode,
        location: assignment.location,
        message: `Success! Your local SMS number ${assignment.phoneNumber} has been assigned for ${assignment.location?.city}, GA`
      }
    })

  } catch (error: any) {
    console.error('Customer signup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create business account'
      },
      { status: 500 }
    )
  }
}