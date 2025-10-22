import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnoseMenuIsolation() {
  console.log('=== Menu Data Isolation Diagnostic ===\n')

  // Get all businesses
  const businesses = await prisma.businessCustomer.findMany({
    select: {
      id: true,
      businessName: true,
      contactEmail: true,
    }
  })

  console.log(`Found ${businesses.length} businesses:\n`)
  for (const business of businesses) {
    console.log(`  - ${business.businessName} (${business.contactEmail})`)
    console.log(`    ID: ${business.id}`)
  }

  console.log('\n=== Checking Menu Ownership ===\n')

  // For each business, check their menus
  for (const business of businesses) {
    const menus = await prisma.menu.findMany({
      where: { businessId: business.id },
      include: {
        menuItems: {
          select: {
            id: true,
            name: true,
            menuId: true
          }
        }
      }
    })

    console.log(`\n${business.businessName}:`)
    console.log(`  Has ${menus.length} menus`)

    for (const menu of menus) {
      console.log(`  - Menu: ${menu.title} (${menu.id})`)
      console.log(`    Date: ${menu.date}`)
      console.log(`    Menu Items: ${menu.menuItems.length}`)

      // Verify all menu items belong to this menu
      for (const item of menu.menuItems) {
        if (item.menuId !== menu.id) {
          console.log(`    ⚠️  WARNING: Menu item ${item.name} (${item.id}) has menuId ${item.menuId} but belongs to menu ${menu.id}`)
        }
      }
    }
  }

  // Check for orphaned menu items (menu items whose menu doesn't exist or belongs to different business)
  console.log('\n\n=== Checking for Orphaned or Cross-Business Menu Items ===\n')

  const allMenuItems = await prisma.menuItem.findMany({
    include: {
      menu: {
        include: {
          businessCustomer: {
            select: {
              id: true,
              businessName: true
            }
          }
        }
      }
    }
  })

  console.log(`Total menu items in database: ${allMenuItems.length}`)

  // Group by business
  const itemsByBusiness = new Map<string, typeof allMenuItems>()
  for (const item of allMenuItems) {
    const businessId = item.menu.businessCustomer.id
    if (!itemsByBusiness.has(businessId)) {
      itemsByBusiness.set(businessId, [])
    }
    itemsByBusiness.get(businessId)!.push(item)
  }

  console.log('\nMenu items per business:')
  for (const [businessId, items] of itemsByBusiness) {
    const businessName = items[0].menu.businessCustomer.businessName
    console.log(`  - ${businessName}: ${items.length} menu items`)
  }

  await prisma.$disconnect()
}

diagnoseMenuIsolation().catch(console.error)
