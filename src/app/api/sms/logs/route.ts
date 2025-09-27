import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const direction = searchParams.get('direction')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')

    const whereCondition: any = {}
    if (direction && direction !== 'ALL') {
      whereCondition.direction = direction
    }
    if (status && status !== 'ALL') {
      whereCondition.status = status
    }

    const smsLogs = await prisma.smsLog.findMany({
      where: whereCondition,
      include: {
        customer: {
          select: {
            id: true,
            phoneNumber: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(smsLogs)
  } catch (error: any) {
    console.error('Failed to fetch SMS logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMS logs' },
      { status: 500 }
    )
  }
}