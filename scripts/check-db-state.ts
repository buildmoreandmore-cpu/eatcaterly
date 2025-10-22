import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkState() {
  const businessCount = await prisma.businessCustomer.count()
  const customerCount = await prisma.customer.count()
  const menuCount = await prisma.menu.count()

  console.log('Database state:')
  console.log(`- Business customers: ${businessCount}`)
  console.log(`- Customers: ${customerCount}`)
  console.log(`- Menus: ${menuCount}`)

  // Get all business customers
  const businesses = await prisma.businessCustomer.findMany({
    select: { id: true, contactEmail: true, businessName: true }
  })

  console.log('\nBusinesses:')
  businesses.forEach(b => {
    console.log(`  - ${b.businessName} (${b.contactEmail}): ID=${b.id}`)
  })

  await prisma.$disconnect()
}

checkState().catch(console.error)
