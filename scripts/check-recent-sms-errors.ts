import { prisma } from '../src/lib/db'

async function checkRecentSMSErrors() {
  console.log('\n🔍 Checking most recent SMS errors...\n')

  const recentSMS = await prisma.smsLog.findMany({
    where: {
      status: 'FAILED'
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      customer: {
        select: {
          name: true,
          phoneNumber: true,
          businessCustomer: {
            select: {
              businessName: true,
              assignedPhoneNumber: true
            }
          }
        }
      }
    }
  })

  if (recentSMS.length === 0) {
    console.log('✅ No failed SMS messages found\n')
    return
  }

  console.log(`Found ${recentSMS.length} recent failed SMS:\n`)

  recentSMS.forEach((sms, index) => {
    console.log(`${index + 1}. SMS ID: ${sms.id}`)
    console.log(`   Time: ${sms.createdAt}`)
    console.log(`   Customer: ${sms.customer?.name} (${sms.customer?.phoneNumber})`)
    console.log(`   Business: ${sms.customer?.businessCustomer?.businessName}`)
    console.log(`   From Number: ${sms.customer?.businessCustomer?.assignedPhoneNumber}`)
    console.log(`   Error: ${sms.errorCode}`)
    console.log(`   Message Preview: ${sms.message.substring(0, 100)}...`)
    console.log('')
  })

  console.log('✅ Done!\n')
}

checkRecentSMSErrors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
