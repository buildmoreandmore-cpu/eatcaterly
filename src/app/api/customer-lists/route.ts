import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessCustomerId = searchParams.get('businessCustomerId')

    if (!businessCustomerId) {
      return NextResponse.json(
        { error: 'Business customer ID is required' },
        { status: 400 }
      )
    }

    const customerLists = await prisma.customerList.findMany({
      where: {
        businessCustomerId,
        isActive: true
      },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: customerLists })
  } catch (error: any) {
    console.error('Error fetching customer lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer lists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, color, businessCustomerId } = await request.json()

    if (!name || !businessCustomerId) {
      return NextResponse.json(
        { error: 'Name and business customer ID are required' },
        { status: 400 }
      )
    }

    // Check if business customer exists
    const businessCustomer = await prisma.businessCustomer.findUnique({
      where: { id: businessCustomerId }
    })

    if (!businessCustomer) {
      return NextResponse.json(
        { error: 'Business customer not found' },
        { status: 404 }
      )
    }

    const customerList = await prisma.customerList.create({
      data: {
        name,
        description,
        color: color || '#3B82F6', // Default blue color
        businessCustomerId,
        isActive: true
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: customerList })
  } catch (error: any) {
    console.error('Error creating customer list:', error)
    return NextResponse.json(
      { error: 'Failed to create customer list' },
      { status: 500 }
    )
  }
}