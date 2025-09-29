import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build where clause for filtering
    const where: any = {}

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
      include: {
        _count: {
          select: {
            orders: true,
            smsLogs: true,
            customerListMembers: true
          }
        },
        customerListMembers: {
          include: {
            customerList: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          },
          take: 3 // Limit to first 3 lists for performance
        }
      },
      orderBy: {
        totalOrders: 'desc'
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
    const { phoneNumber, name, email, category, tags, notes } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phoneNumber }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' },
        { status: 409 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        phoneNumber,
        name: name || null,
        email: email || null,
        category: category || 'New',
        tags: tags || ['New'],
        notes: notes || null,
        isActive: true
      },
      include: {
        _count: {
          select: {
            orders: true,
            smsLogs: true,
            customerListMembers: true
          }
        }
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}