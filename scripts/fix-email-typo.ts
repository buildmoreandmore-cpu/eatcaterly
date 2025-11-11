import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixEmailTypo() {
  console.log('=== FIXING EMAIL TYPO ===\n')

  try {
    // Find the account with the typo
    const typoAccount = await prisma.businessCustomer.findFirst({
      where: { contactEmail: 'martin@homeower-support.com' }
    })

    if (!typoAccount) {
      console.log('No account with typo found!')
      return
    }

    console.log('Found account with typo:')
    console.log(`  Current email: ${typoAccount.contactEmail}`)
    console.log(`  Business: ${typoAccount.businessName}`)
    console.log(`  ID: ${typoAccount.id}`)

    // Update to correct email
    const updated = await prisma.businessCustomer.update({
      where: { id: typoAccount.id },
      data: { contactEmail: 'martin@homeowner-support.com' }
    })

    console.log(`\n✅ Email updated to: ${updated.contactEmail}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixEmailTypo()
