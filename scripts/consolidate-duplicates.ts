import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function consolidateDuplicates() {
  console.log('=== CONSOLIDATING DUPLICATE ACCOUNTS ===\n')

  try {
    // Find all martin@homeowner-support.com variations
    const martinAccounts = await prisma.businessCustomer.findMany({
      where: {
        OR: [
          { contactEmail: { contains: 'martin@homeowner-support.com', mode: 'insensitive' } },
          { contactEmail: { contains: 'martin@homeower-support.com', mode: 'insensitive' } }
        ]
      },
      include: {
        menus: true,
        customers: true
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`Found ${martinAccounts.length} accounts:`)
    martinAccounts.forEach((acc, i) => {
      console.log(`  ${i + 1}. ${acc.contactEmail}`)
      console.log(`     Business: ${acc.businessName}`)
      console.log(`     Menus: ${acc.menus.length}`)
      console.log(`     Customers: ${acc.customers.length}`)
      console.log(`     ID: ${acc.id}`)
    })

    if (martinAccounts.length <= 1) {
      console.log('\nNo duplicates to consolidate!')
      return
    }

    // Use the account with the most data, or the oldest one
    const mainAccount = martinAccounts.reduce((prev, curr) => {
      const prevScore = prev.menus.length + prev.customers.length
      const currScore = curr.menus.length + curr.customers.length
      return currScore > prevScore ? curr : prev
    })

    console.log(`\n✅ Keeping: ${mainAccount.contactEmail} (${mainAccount.businessName})`)
    console.log(`   ID: ${mainAccount.id}`)

    // Move data from other accounts to main account
    const otherAccounts = martinAccounts.filter(acc => acc.id !== mainAccount.id)

    for (const otherAccount of otherAccounts) {
      console.log(`\n📦 Migrating from: ${otherAccount.contactEmail}`)

      // Move menus
      if (otherAccount.menus.length > 0) {
        const result = await prisma.menu.updateMany({
          where: { businessId: otherAccount.id },
          data: { businessId: mainAccount.id }
        })
        console.log(`   ✓ Moved ${result.count} menus`)
      }

      // Move customers
      if (otherAccount.customers.length > 0) {
        const result = await prisma.customer.updateMany({
          where: { businessId: otherAccount.id },
          data: { businessId: mainAccount.id }
        })
        console.log(`   ✓ Moved ${result.count} customers`)
      }

      // Delete the duplicate account
      await prisma.businessCustomer.delete({
        where: { id: otherAccount.id }
      })
      console.log(`   ✓ Deleted duplicate account`)
    }

    console.log(`\n✅ Consolidation complete!`)
    console.log(`\nFinal account:`)
    const final = await prisma.businessCustomer.findUnique({
      where: { id: mainAccount.id },
      include: {
        _count: {
          select: {
            menus: true,
            customers: true
          }
        }
      }
    })
    console.log(`  Email: ${final!.contactEmail}`)
    console.log(`  Business: ${final!.businessName}`)
    console.log(`  Menus: ${final!._count.menus}`)
    console.log(`  Customers: ${final!._count.customers}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

consolidateDuplicates()
