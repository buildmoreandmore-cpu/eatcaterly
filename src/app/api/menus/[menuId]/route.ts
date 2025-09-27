import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params
    const { title, isActive, menuItems } = await request.json()

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
    const { menuId } = await params

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