import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBusiness() {
  console.log('=== CHECKING MFESSBAR@GMAIL.COM BUSINESS ===\n')

  try {
    const testEmails = [
      'mfessbar@gmail.com',
      'MFESSBAR@GMAIL.COM',
      'Mfessbar@gmail.com',
    ]

    for (const email of testEmails) {
      console.log(`\nTesting email: ${email}`)

      const business = await prisma.businessCustomer.findFirst({
        where: {
          contactEmail: {
            equals: email,
            mode: 'insensitive'
          }
        },
        include: {
          _count: {
            select: {
              menus: true,
              customers: true
            }
          }
        }
      })

      if (business) {
        console.log('✅ Found:')
        console.log('   Business Name:', business.businessName)
        console.log('   Stored Email:', business.contactEmail)
        console.log('   Business ID:', business.id)
        console.log('   Assigned Phone:', business.assignedPhoneNumber)
        console.log('   Onboarding Completed:', business.onboardingCompleted)
        console.log('   Subscription Status:', business.subscriptionStatus)
        console.log('   Menus:', business._count.menus)
        console.log('   Customers:', business._count.customers)
        console.log('   Created:', business.createdAt)
      } else {
        console.log('❌ Not found')
      }
    }

    // Also check if there are any email mismatches
    console.log('\n\n=== ALL BUSINESS RECORDS ===')
    const allBusinesses = await prisma.businessCustomer.findMany({
      select: {
        id: true,
        contactEmail: true,
        businessName: true,
        onboardingCompleted: true
      }
    })

    console.log(`\nTotal businesses: ${allBusinesses.length}`)
    allBusinesses.forEach(b => {
      console.log(`  - ${b.contactEmail} (${b.businessName}) [${b.id.substring(0, 8)}...]`)
      console.log(`    Onboarding: ${b.onboardingCompleted}`)
    })

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkBusiness()
