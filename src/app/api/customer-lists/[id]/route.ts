import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customerList = await prisma.customerList.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
                email: true,
                category: true,
                tags: true,
                totalOrders: true,
                totalSpent: true,
                lastOrderAt: true,
                createdAt: true
              }
            }
          },
          orderBy: { addedAt: 'desc' }
        },
        businessCustomer: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    })

    if (!customerList) {
      return NextResponse.json(
        { error: 'Customer list not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: customerList })
  } catch (error: any) {
    console.error('Error fetching customer list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer list' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, description, color, isActive } = await request.json()

    const customerList = await prisma.customerList.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: customerList })
  } catch (error: any) {
    console.error('Error updating customer list:', error)
    return NextResponse.json(
      { error: 'Failed to update customer list' },
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
    // Check if list exists
    const customerList = await prisma.customerList.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } }
    })

    if (!customerList) {
      return NextResponse.json(
        { error: 'Customer list not found' },
        { status: 404 }
      )
    }

    // Delete the list (members will be cascade deleted)
    await prisma.customerList.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: `Customer list deleted with ${customerList._count.members} members`
    })
  } catch (error: any) {
    console.error('Error deleting customer list:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer list' },
      { status: 500 }
    )
  }
}