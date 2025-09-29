import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { category, tags, notes } = await request.json()

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Update customer categorization
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(notes !== undefined && { notes })
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        category: true,
        tags: true,
        notes: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ success: true, data: updatedCustomer })
  } catch (error: any) {
    console.error('Error updating customer categorization:', error)
    return NextResponse.json(
      { error: 'Failed to update customer categorization' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        category: true,
        tags: true,
        notes: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderAt: true,
        createdAt: true,
        updatedAt: true,
        customerListMembers: {
          include: {
            customerList: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: customer })
  } catch (error: any) {
    console.error('Error fetching customer categorization:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer categorization' },
      { status: 500 }
    )
  }
}