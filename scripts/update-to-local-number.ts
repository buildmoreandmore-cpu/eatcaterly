import { prisma } from '../src/lib/db'

/**
 * Update from toll-free trial number to local number (678) 812-0099
 */
async function updateToLocalNumber() {
  try {
    const businessEmail = 'mfessbar@gmail.com'
    const newLocalNumber = '+16788120099'
    const oldTollFreeNumber = '+18555608769'

    console.log(`Updating business account: ${businessEmail}`)
    console.log(`From: ${oldTollFreeNumber}`)
    console.log(`To: ${newLocalNumber}`)

    // Find the business account
    const business = await prisma.businessCustomer.findUnique({
      where: { contactEmail: businessEmail },
    })

    if (!business) {
      console.error(`Business account not found: ${businessEmail}`)
      return
    }

    console.log(`Found business: ${business.businessName} (${business.id})`)

    // Update the business with the new local phone number
    const updated = await prisma.businessCustomer.update({
      where: { id: business.id },
      data: {
        assignedPhoneNumber: newLocalNumber,
        numberProvisionedAt: new Date(),
      },
    })

    console.log(`\n✅ Successfully updated phone number!`)
    console.log(`   Business: ${updated.businessName}`)
    console.log(`   New Phone: ${updated.assignedPhoneNumber}`)
    console.log(`   Updated At: ${updated.numberProvisionedAt}`)
    console.log(`\n📱 Make sure to configure the webhook in Twilio for this number:`)
    console.log(`   Number: (678) 812-0099`)
    console.log(`   Webhook: https://www.eatcaterly.com/api/webhooks/sms`)
    console.log(`   Method: HTTP POST`)
  } catch (error) {
    console.error('Error updating phone number:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateToLocalNumber()
