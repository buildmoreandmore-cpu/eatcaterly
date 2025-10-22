import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUserBusinessId } from '@/lib/auth-utils.server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const businessId = await getCurrentUserBusinessId()
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business not found for current user' },
        { status: 404 }
      )
    }

    const { menuId } = await params
    const { title, isActive, menuItems } = await request.json()

    // Verify menu belongs to this business
    const existingMenu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        businessId
      }
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found or access denied' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (isActive !== undefined) updateData.isActive = isActive

    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: updateData,
      include: {
        menuItems: true
      }
    })

    return NextResponse.json(menu)
  } catch (error: any) {
    console.error('Failed to update menu:', error)
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const businessId = await getCurrentUserBusinessId()
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business not found for current user' },
        { status: 404 }
      )
    }

    const { menuId } = await params

    // Verify menu belongs to this business
    const existingMenu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        businessId
      }
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found or access denied' },
        { status: 404 }
      )
    }

    // Delete menu items first (cascade delete)
    await prisma.menuItem.deleteMany({
      where: { menuId }
    })

    // Delete menu
    await prisma.menu.delete({
      where: { id: menuId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
}