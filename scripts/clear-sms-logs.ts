import { prisma } from '../src/lib/db'

async function clearSMSLogs() {
  try {
    // Get current count
    const currentCount = await prisma.smsLog.count()
    console.log(`\n📊 Current SMS Logs: ${currentCount}`)

    if (currentCount === 0) {
      console.log('✅ Database is already clean - no SMS logs to delete\n')
      return
    }

    // Delete all SMS logs
    const result = await prisma.smsLog.deleteMany({})

    console.log(`\n✅ Deleted ${result.count} SMS logs`)
    console.log('📊 New SMS count: 0\n')

    // Verify deletion
    const finalCount = await prisma.smsLog.count()
    if (finalCount === 0) {
      console.log('✅ All SMS logs successfully cleared!\n')
    } else {
      console.log(`⚠️  Warning: ${finalCount} SMS logs still remain\n`)
    }

  } catch (error) {
    console.error('❌ Error clearing SMS logs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearSMSLogs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
