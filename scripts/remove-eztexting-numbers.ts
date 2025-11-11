import { prisma } from '../src/lib/db'

/**
 * Remove all EZTexting phone numbers from business customer profiles
 * This clears out the old phone numbers except for the Twilio trial number
 */
async function removeEZTextingNumbers() {
  try {
    const twilioTrialNumber = '+18555608769'

    console.log('Finding all business customers with assigned phone numbers...')

    // Find all businesses with phone numbers
    const businesses = await prisma.businessCustomer.findMany({
      where: {
        assignedPhoneNumber: {
          not: null,
        },
      },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        assignedPhoneNumber: true,
      },
    })

    console.log(`Found ${businesses.length} businesses with phone numbers`)

    // Update all businesses except the one with the Twilio trial number
    for (const business of businesses) {
      if (business.assignedPhoneNumber === twilioTrialNumber) {
        console.log(`  ✓ Keeping Twilio trial number for: ${business.businessName} (${business.contactEmail})`)
        continue
      }

      await prisma.businessCustomer.update({
        where: { id: business.id },
        data: {
          assignedPhoneNumber: null,
          numberProvisionedAt: null,
        },
      })

      console.log(`  ✓ Removed ${business.assignedPhoneNumber} from: ${business.businessName} (${business.contactEmail})`)
    }

    console.log('\n✅ Successfully removed all EZTexting phone numbers')
    console.log(`   Kept Twilio trial number: ${twilioTrialNumber}`)
  } catch (error) {
    console.error('Error removing EZTexting numbers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeEZTextingNumbers()
