import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserBusinessId } from '@/lib/auth-utils.server'

export async function GET(request: NextRequest) {
  try {
    const businessId = await getCurrentUserBusinessId()
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business not found for current user' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build where clause for filtering
    const where: any = { businessId }

    if (!includeInactive) {
      where.isActive = true
    }

    if (category) {
      where.category = category
    }

    if (tags) {
      const tagList = tags.split(',')
      where.tags = {
        hasSome: tagList
      }
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(customers)
  } catch (error: any) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[POST /api/customers] Starting customer creation')

    const businessId = await getCurrentUserBusinessId()
    console.log('[POST /api/customers] businessId:', businessId)

    if (!businessId) {
      console.error('[POST /api/customers] No businessId found - user may not have completed onboarding')
      return NextResponse.json(
        { error: 'Business account not found. Please complete onboarding first or contact support.' },
        { status: 404 }
      )
    }

    const { phoneNumber, name, email } = await request.json()
    console.log('[POST /api/customers] Request data:', { phoneNumber, name, email })

    if (!phoneNumber) {
      console.error('[POST /api/customers] No phone number provided')
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Normalize phone number to E.164 format
    const normalizePhoneNumber = (phone: string): string => {
      const digitsOnly = phone.replace(/\D/g, '')
      if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return `+${digitsOnly}`
      }
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`
      }
      if (phone.startsWith('+')) {
        return phone
      }
      return `+1${digitsOnly}`
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    console.log('[POST /api/customers] Normalized phone:', normalizedPhone)

    // Check if customer already exists for this business
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        businessId,
        phoneNumber: normalizedPhone
      }
    })

    if (existingCustomer) {
      console.log('[POST /api/customers] Customer already exists:', existingCustomer.id)
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' },
        { status: 409 }
      )
    }

    console.log('[POST /api/customers] Creating new customer...')
    const customer = await prisma.customer.create({
      data: {
        businessId,
        phoneNumber: normalizedPhone,
        name: name || null,
        email: email || null,
        isActive: true
      }
    })

    console.log('[POST /api/customers] Customer created successfully:', customer.id)
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/customers] Error creating customer:', error)
    console.error('[POST /api/customers] Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const businessId = await getCurrentUserBusinessId()
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business not found for current user' },
        { status: 404 }
      )
    }

    const url = new URL(request.url)
    const customerId = url.searchParams.get('id')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Verify customer belongs to this business
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.customer.delete({
      where: { id: customerId }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const businessId = await getCurrentUserBusinessId()
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business not found for current user' },
        { status: 404 }
      )
    }

    const { id, phoneNumber, name, email } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Verify customer belongs to this business
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        businessId
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      )
    }

    // Normalize phone number if provided
    let normalizedPhone = phoneNumber
    if (phoneNumber) {
      const normalizePhoneNumber = (phone: string): string => {
        const digitsOnly = phone.replace(/\D/g, '')
        if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
          return `+${digitsOnly}`
        }
        if (digitsOnly.length === 10) {
          return `+1${digitsOnly}`
        }
        if (phone.startsWith('+')) {
          return phone
        }
        return `+1${digitsOnly}`
      }
      normalizedPhone = normalizePhoneNumber(phoneNumber)
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(normalizedPhone && { phoneNumber: normalizedPhone }),
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email })
      }
    })

    return NextResponse.json(customer, { status: 200 })
  } catch (error: any) {
    console.error('Failed to update customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}