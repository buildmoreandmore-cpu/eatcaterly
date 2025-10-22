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
    const date = searchParams.get('date')

    const whereCondition: any = { businessId }
    if (date) {
      whereCondition.date = new Date(date)
    }

    const menus = await prisma.menu.findMany({
      where: whereCondition,
      include: {
        menuItems: {
          orderBy: { category: 'asc' }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(menus)
  } catch (error: any) {
    console.error('Failed to fetch menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const businessId = await getCurrentUserBusinessId()
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business not found for current user' },
        { status: 404 }
      )
    }

    const { title, date, menuItems } = await request.json()

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      )
    }

    // Check if menu already exists for this business on this date
    const existingMenu = await prisma.menu.findFirst({
      where: {
        businessId,
        date: new Date(date)
      }
    })

    if (existingMenu) {
      return NextResponse.json(
        { error: 'A menu already exists for this date' },
        { status: 409 }
      )
    }

    const menu = await prisma.menu.create({
      data: {
        businessId,
        title,
        date: new Date(date),
        isActive: true,
        menuItems: {
          create: menuItems.map((item: any) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            isAvailable: true
          }))
        }
      },
      include: {
        menuItems: true
      }
    })

    return NextResponse.json(menu, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create menu:', error)
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
}