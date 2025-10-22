import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLocationForZipCode, getAreaCodeForZipCode } from '@/lib/phone-number-assignment'
import { getAvailableNumber, assignNumber, addToInventory } from '@/lib/phone-inventory'
import ezTexting from '@/lib/ez-texting'

export async function POST(request: NextRequest) {
  console.log('[Onboarding] POST handler called')

  // Wrap everything in a master try-catch to ensure we ALWAYS return JSON
  try {
    console.log('[Onboarding] Parsing request body')
    const { zipCode, businessName, contactEmail, contactName, clerkUserId, promoCode } = await request.json()
    console.log('[Onboarding] Request body parsed successfully')

    console.log('[Onboarding] Request received:', { zipCode, businessName, contactEmail, contactName, promoCode })

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('[Onboarding] Database connection successful')
    } catch (dbError: any) {
      console.error('[Onboarding] Database connection failed:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection error. Please try again in a moment.'
        },
        { status: 500 }
      )
    }

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
    console.log('[Onboarding] Checking for existing customer:', contactEmail)
    const existingCustomer = await prisma.businessCustomer.findUnique({
      where: { contactEmail }
    })
    console.log('[Onboarding] Existing customer check complete:', existingCustomer ? 'Found' : 'Not found')

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

    // Get location and area code for zip code
    const location = getLocationForZipCode(zipCode)
    const areaCode = getAreaCodeForZipCode(zipCode)

    if (!areaCode) {
      return NextResponse.json(
        {
          success: false,
          error: `Unable to find area code for zip code ${zipCode}. Please verify your zip code and try again.`
        },
        { status: 400 }
      )
    }

    // Check if promo code provides free phone number
    let skipPhoneProvisioning = false
    if (promoCode) {
      try {
        const promoRecord = await prisma.promoCode.findUnique({
          where: { code: promoCode }
        })
        if (promoRecord && promoRecord.freePhoneNumber) {
          console.log('[Onboarding] Promo code provides free phone number, skipping provisioning')
          skipPhoneProvisioning = true
        }
      } catch (err) {
        console.error('[Onboarding] Error checking promo code:', err)
        // Continue anyway if promo check fails
      }
    }

    // Smart number assignment: Check inventory first, then purchase if needed
    let phoneNumber: string | null = null
    let inventoryId: string | undefined

    // Only provision phone number if not skipping
    if (!skipPhoneProvisioning) {
      // 1. Try to get number from inventory (available or cooldown expired)
      const inventoryResult = await getAvailableNumber(areaCode)

      if (inventoryResult.success && inventoryResult.number) {
        // Found number in inventory
        phoneNumber = inventoryResult.number.phoneNumber
        inventoryId = inventoryResult.number.id
        console.log(`Using ${inventoryResult.source} number from inventory: ${phoneNumber}`)
      } else {
        // 2. No inventory number - purchase new one from EZTexting
        console.log(`No inventory number available for area code ${areaCode}, purchasing new number...`)

        const provisionResult = await ezTexting.provisionPhoneNumber(areaCode)

        if (!provisionResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: provisionResult.error || 'Failed to provision phone number'
            },
            { status: 500 }
          )
        }

        phoneNumber = provisionResult.phoneNumber!

        // Add newly purchased number to inventory
        const addResult = await addToInventory({
          phoneNumber: provisionResult.phoneNumber!,
          ezTextingNumberId: provisionResult.numberId!,
          areaCode: provisionResult.areaCode!,
        })

        if (addResult.success) {
          inventoryId = addResult.inventoryId
          console.log(`New number ${phoneNumber} added to inventory`)
        }
      }
    } else {
      console.log('[Onboarding] Skipping phone provisioning due to promo code')
    }

    // Create or update business customer record
    console.log('[Onboarding] Creating/updating business customer:', { businessName, contactEmail, phoneNumber })

    let businessCustomer
    try {
      businessCustomer = existingCustomer
        ? await prisma.businessCustomer.update({
            where: { id: existingCustomer.id },
            data: {
              businessName,
              contactName,
              zipCode,
              assignedPhoneNumber: phoneNumber,
              areaCode: areaCode,
              city: location?.city,
              state: location?.state,
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
              assignedPhoneNumber: phoneNumber,
              areaCode: areaCode,
              city: location?.city,
              state: location?.state,
              onboardingCompleted: false,
              isActive: true,
            }
          })

      console.log('[Onboarding] Business customer created/updated successfully:', businessCustomer.id)
    } catch (dbError: any) {
      console.error('[Onboarding] Database error creating/updating business customer:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack
      })
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${dbError.message || 'Failed to create business profile'}`
        },
        { status: 500 }
      )
    }

    // Mark inventory number as assigned to this business
    if (inventoryId) {
      await assignNumber(inventoryId, businessCustomer.id)
    }

    // TODO: Send welcome email with phone number details
    console.log(`Welcome email would be sent to ${contactEmail}`)

    const successMessage = phoneNumber
      ? `Success! Your local SMS number ${phoneNumber} has been assigned for ${location?.city}, ${location?.state}`
      : `Success! Your business profile has been created for ${location?.city}, ${location?.state}`

    return NextResponse.json({
      success: true,
      data: {
        businessId: businessCustomer.id,
        businessName: businessCustomer.businessName,
        assignedPhoneNumber: phoneNumber,
        areaCode: areaCode,
        location: location,
        message: successMessage
      }
    })

  } catch (error: any) {
    // CRITICAL: This catch block MUST return JSON, never HTML
    console.error('[Onboarding] CRITICAL - Unhandled error in route handler:', {
      errorType: typeof error,
      errorName: error?.name,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause,
      fullError: error
    })

    // Ensure we always return a valid JSON response
    try {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || 'An unexpected error occurred during onboarding. Please try again or contact support.',
          errorType: error?.name || 'Unknown'
        },
        { status: 500 }
      )
    } catch (jsonError) {
      // If even creating the JSON response fails, log it
      console.error('[Onboarding] CRITICAL - Failed to create error response:', jsonError)
      // Return a minimal response
      return new Response(
        JSON.stringify({ success: false, error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}
