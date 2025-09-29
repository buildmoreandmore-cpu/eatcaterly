import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { customerIds, addedBy, notes } = await request.json()

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs array is required' },
        { status: 400 }
      )
    }

    // Check if customer list exists
    const customerList = await prisma.customerList.findUnique({
      where: { id }
    })

    if (!customerList) {
      return NextResponse.json(
        { error: 'Customer list not found' },
        { status: 404 }
      )
    }

    // Check if customers exist
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds }
      }
    })

    if (customers.length !== customerIds.length) {
      return NextResponse.json(
        { error: 'One or more customers not found' },
        { status: 404 }
      )
    }

    // Get existing memberships to avoid duplicates
    const existingMembers = await prisma.customerListMember.findMany({
      where: {
        customerListId: id,
        customerId: { in: customerIds }
      }
    })

    const existingCustomerIds = existingMembers.map(m => m.customerId)
    const newCustomerIds = customerIds.filter(id => !existingCustomerIds.includes(id))

    if (newCustomerIds.length === 0) {
      return NextResponse.json(
        { error: 'All customers are already members of this list' },
        { status: 409 }
      )
    }

    // Add new members
    const newMembers = await prisma.customerListMember.createMany({
      data: newCustomerIds.map(customerId => ({
        customerListId: id,
        customerId,
        addedBy,
        notes
      }))
    })

    // Return updated list with members
    const updatedList = await prisma.customerList.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
                category: true,
                tags: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedList,
      message: `Added ${newMembers.count} new members to the list`
    })
  } catch (error: any) {
    console.error('Error adding members to customer list:', error)
    return NextResponse.json(
      { error: 'Failed to add members to customer list' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const customerIds = searchParams.get('customerIds')?.split(',') || []

    if (customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs are required' },
        { status: 400 }
      )
    }

    // Remove members from list
    const deletedMembers = await prisma.customerListMember.deleteMany({
      where: {
        customerListId: id,
        customerId: { in: customerIds }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Removed ${deletedMembers.count} members from the list`
    })
  } catch (error: any) {
    console.error('Error removing members from customer list:', error)
    return NextResponse.json(
      { error: 'Failed to remove members from customer list' },
      { status: 500 }
    )
  }
}