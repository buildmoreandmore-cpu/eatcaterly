import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDataIsolation() {
  console.log('=== DATA ISOLATION DIAGNOSTIC ===\n')

  try {
    // 1. Check all business customers
    const businesses = await prisma.businessCustomer.findMany({
      select: {
        id: true,
        contactEmail: true,
        businessName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`Total Businesses: ${businesses.length}`)
    businesses.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.businessName} (${b.contactEmail})`)
      console.log(`     ID: ${b.id}`)
      console.log(`     Created: ${b.createdAt}`)
    })

    // 2. Check menu distribution
    console.log('\n=== MENU DISTRIBUTION ===')
    for (const business of businesses) {
      const menuCount = await prisma.menu.count({
        where: { businessId: business.id }
      })
      console.log(`${business.contactEmail}: ${menuCount} menus`)
    }

    // 3. Check customer distribution
    console.log('\n=== CUSTOMER DISTRIBUTION ===')
    for (const business of businesses) {
      const customerCount = await prisma.customer.count({
        where: { businessId: business.id }
      })
      console.log(`${business.contactEmail}: ${customerCount} customers`)
    }

    // 4. Total counts
    const totalMenus = await prisma.menu.count()
    const totalCustomers = await prisma.customer.count()

    console.log('\n=== TOTAL COUNTS ===')
    console.log(`Total menus: ${totalMenus}`)
    console.log(`Total customers: ${totalCustomers}`)

    // 5. Show all menus with their business
    console.log('\n=== ALL MENUS ===')
    const allMenus = await prisma.menu.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        businessId: true,
        businessCustomer: {
          select: {
            contactEmail: true,
            businessName: true
          }
        }
      }
    })
    allMenus.forEach(m => {
      console.log(`  - ${m.title} (${new Date(m.date).toLocaleDateString()})`)
      console.log(`    Business: ${m.businessCustomer.businessName} (${m.businessCustomer.contactEmail})`)
      console.log(`    BusinessId: ${m.businessId}`)
    })

    // 6. Show all customers with their business
    console.log('\n=== ALL CUSTOMERS ===')
    const allCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        businessId: true,
        businessCustomer: {
          select: {
            contactEmail: true,
            businessName: true
          }
        }
      }
    })
    allCustomers.forEach(c => {
      console.log(`  - ${c.name || 'Unnamed'} (${c.phoneNumber})`)
      console.log(`    Business: ${c.businessCustomer.businessName} (${c.businessCustomer.contactEmail})`)
      console.log(`    BusinessId: ${c.businessId}`)
    })

  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDataIsolation()
