import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function applyMigration() {
  console.log('Applying business isolation migration...')

  try {
    // Execute each migration step separately
    console.log('1. Adding businessId columns...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "customers" ADD COLUMN "businessId" TEXT`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "menus" ADD COLUMN "businessId" TEXT`)

    console.log('2. Assigning existing data to first business...')
    await prisma.$executeRawUnsafe(`
      UPDATE "customers"
      SET "businessId" = (SELECT id FROM "business_customers" ORDER BY "createdAt" LIMIT 1)
      WHERE "businessId" IS NULL
    `)
    await prisma.$executeRawUnsafe(`
      UPDATE "menus"
      SET "businessId" = (SELECT id FROM "business_customers" ORDER BY "createdAt" LIMIT 1)
      WHERE "businessId" IS NULL
    `)

    console.log('3. Making businessId non-nullable...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "customers" ALTER COLUMN "businessId" SET NOT NULL`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "menus" ALTER COLUMN "businessId" SET NOT NULL`)

    console.log('4. Adding foreign key constraints...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "customers" ADD CONSTRAINT "customers_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "business_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "menus" ADD CONSTRAINT "menus_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "business_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `)

    console.log('5. Updating menu constraints...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "menus" DROP CONSTRAINT IF EXISTS "menus_date_key"`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "menus" ADD CONSTRAINT "menus_businessId_date_key" UNIQUE ("businessId", "date")`)

    console.log('✅ Migration applied successfully!')

    // Verify the changes
    const customerCount = await prisma.customer.count()
    const menuCount = await prisma.menu.count()

    console.log(`\nVerification:`)
    console.log(`- Customers in database: ${customerCount}`)
    console.log(`- Menus in database: ${menuCount}`)
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration().catch(console.error)
