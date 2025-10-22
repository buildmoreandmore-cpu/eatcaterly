import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPhoneNumberConstraint() {
  console.log('=== FIXING PHONE NUMBER UNIQUE CONSTRAINT ===\n')

  try {
    console.log('1. Dropping global unique constraint on phoneNumber...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_phoneNumber_key";
    `)
    console.log('   ✓ Global constraint removed')

    console.log('\n2. Creating compound unique constraint on (businessId, phoneNumber)...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "customers"
      ADD CONSTRAINT "customers_businessId_phoneNumber_key"
      UNIQUE ("businessId", "phoneNumber");
    `)
    console.log('   ✓ Compound constraint created')

    console.log('\n✅ Migration complete!')
    console.log('\nPhone numbers are now unique per business, not globally.')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('Full error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixPhoneNumberConstraint()
