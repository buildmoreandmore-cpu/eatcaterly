import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { customerIds, category, tags, notes, action } = await request.json()

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs array is required' },
        { status: 400 }
      )
    }

    if (!action || !['update', 'add_tags', 'remove_tags'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action is required (update, add_tags, remove_tags)' },
        { status: 400 }
      )
    }

    // Check if customers exist
    const existingCustomers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, tags: true }
    })

    if (existingCustomers.length !== customerIds.length) {
      return NextResponse.json(
        { error: 'One or more customers not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'update':
        updateData = {
          ...(category !== undefined && { category }),
          ...(tags !== undefined && { tags }),
          ...(notes !== undefined && { notes })
        }
        break

      case 'add_tags':
        if (!tags || !Array.isArray(tags)) {
          return NextResponse.json(
            { error: 'Tags array is required for add_tags action' },
            { status: 400 }
          )
        }
        // We'll handle this in a transaction to merge tags for each customer
        break

      case 'remove_tags':
        if (!tags || !Array.isArray(tags)) {
          return NextResponse.json(
            { error: 'Tags array is required for remove_tags action' },
            { status: 400 }
          )
        }
        // We'll handle this in a transaction to remove tags from each customer
        break
    }

    let updatedCustomers

    if (action === 'update') {
      // Simple update for all customers
      await prisma.customer.updateMany({
        where: { id: { in: customerIds } },
        data: updateData
      })

      // Fetch updated customers
      updatedCustomers = await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          category: true,
          tags: true,
          notes: true
        }
      })
    } else {
      // Handle tag operations individually
      updatedCustomers = await Promise.all(
        existingCustomers.map(async (customer) => {
          let newTags = customer.tags || []

          if (action === 'add_tags') {
            // Add new tags, avoiding duplicates
            const tagsToAdd = tags.filter((tag: string) => !newTags.includes(tag))
            newTags = [...newTags, ...tagsToAdd]
          } else if (action === 'remove_tags') {
            // Remove specified tags
            newTags = newTags.filter((tag: string) => !tags.includes(tag))
          }

          return await prisma.customer.update({
            where: { id: customer.id },
            data: { tags: newTags },
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              category: true,
              tags: true,
              notes: true
            }
          })
        })
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedCustomers,
      message: `Successfully ${action === 'update' ? 'updated' : action === 'add_tags' ? 'added tags to' : 'removed tags from'} ${updatedCustomers.length} customers`
    })
  } catch (error: any) {
    console.error('Error bulk updating customer categorization:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update customer categorization' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { filters } = await request.json()

    // Build where clause based on filters
    const where: any = {}

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags
      }
    }

    if (filters?.minOrders) {
      where.totalOrders = {
        gte: filters.minOrders
      }
    }

    if (filters?.minSpent) {
      where.totalSpent = {
        gte: filters.minSpent
      }
    }

    if (filters?.lastOrderAfter) {
      where.lastOrderAt = {
        gte: new Date(filters.lastOrderAfter)
      }
    }

    const customers = await prisma.customer.findMany({
      where,
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
      },
      orderBy: { totalOrders: 'desc' }
    })

    return NextResponse.json({ success: true, data: customers })
  } catch (error: any) {
    console.error('Error filtering customers:', error)
    return NextResponse.json(
      { error: 'Failed to filter customers' },
      { status: 500 }
    )
  }
}