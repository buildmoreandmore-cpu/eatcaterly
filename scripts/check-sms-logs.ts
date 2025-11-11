import { prisma } from '../src/lib/db'

async function checkSMSLogs() {
  // Get total count
  const totalCount = await prisma.smsLog.count()
  console.log(`\n📊 Total SMS Logs in database: ${totalCount}`)

  // Get all SMS logs with customer and business info
  const logs = await prisma.smsLog.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      customer: {
        select: {
          name: true,
          phoneNumber: true,
          businessId: true,
          businessCustomer: {
            select: {
              businessName: true,
              contactEmail: true
            }
          }
        }
      }
    }
  })

  console.log(`\n📋 SMS Logs Details:`)
  console.log(`===================`)

  // Group by business
  const byBusiness = new Map<string, number>()
  let orphanedSms = 0

  logs.forEach((log, index) => {
    console.log(`\n${index + 1}. ${log.direction} - ${log.status}`)
    console.log(`   Message: ${log.message.substring(0, 60)}${log.message.length > 60 ? '...' : ''}`)
    console.log(`   Created: ${log.createdAt}`)

    if (log.customer) {
      console.log(`   Customer: ${log.customer.phoneNumber}`)
      if (log.customer.businessCustomer) {
        console.log(`   Business: ${log.customer.businessCustomer.businessName} (${log.customer.businessCustomer.contactEmail})`)
        const businessName = log.customer.businessCustomer.businessName
        byBusiness.set(businessName, (byBusiness.get(businessName) || 0) + 1)
      } else {
        console.log(`   ⚠️  Customer has no business`)
        orphanedSms++
      }
    } else {
      console.log(`   ⚠️  No customer associated`)
      orphanedSms++
    }
  })

  console.log(`\n\n📈 SMS Count by Business:`)
  console.log(`=========================`)
  byBusiness.forEach((count, businessName) => {
    console.log(`${businessName}: ${count} SMS`)
  })

  if (orphanedSms > 0) {
    console.log(`\n⚠️  Orphaned SMS (no business): ${orphanedSms}`)
  }

  console.log(`\n✅ Done!\n`)
}

checkSMSLogs().then(() => process.exit(0)).catch(console.error)
