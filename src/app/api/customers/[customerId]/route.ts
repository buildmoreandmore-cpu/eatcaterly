import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params
    const { name, isActive } = await request.json()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name || null
    if (isActive !== undefined) updateData.isActive = isActive

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
      include: {
        _count: {
          select: {
            orders: true,
            smsLogs: true
          }
        }
      }
    })

    return NextResponse.json(customer)
  } catch (error: any) {
    console.error('Failed to update customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params

    await prisma.customer.delete({
      where: { id: customerId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}