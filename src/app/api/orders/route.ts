import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const limit = parseInt(searchParams.get('limit') || '100')

    const whereCondition: any = {}
    if (status && status !== 'ALL') {
      whereCondition.status = status
    }
    if (customerId) {
      whereCondition.customerId = customerId
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        customer: {
          select: {
            id: true,
            phoneNumber: true,
            name: true
          }
        },
        menu: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}