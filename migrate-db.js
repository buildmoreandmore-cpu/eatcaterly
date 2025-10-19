const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('Adding new columns to business_customers table...')

    await prisma.$executeRaw`
      ALTER TABLE business_customers
      ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "ezTextingNumberId" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "numberProvisionedAt" TIMESTAMP(3)
    `

    console.log('✓ Migration completed successfully!')

    // Verify the columns were added
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'business_customers'
      AND column_name IN ('stripeCustomerId', 'stripeSubscriptionId', 'ezTextingNumberId', 'numberProvisionedAt')
      ORDER BY column_name
    `

    console.log('\nVerification - New columns added:')
    console.table(result)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
