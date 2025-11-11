import { prisma } from '../src/lib/db'

/**
 * Assign Twilio trial phone number to mfessbar@gmail.com business account
 */
async function assignTrialNumber() {
  try {
    const businessEmail = 'mfessbar@gmail.com'
    const twilioTrialNumber = '+18555608769'

    console.log(`Looking for business account: ${businessEmail}`)

    // Find the business account
    const business = await prisma.businessCustomer.findUnique({
      where: { contactEmail: businessEmail },
    })

    if (!business) {
      console.error(`Business account not found: ${businessEmail}`)
      return
    }

    console.log(`Found business: ${business.businessName} (${business.id})`)

    // Update the business with the Twilio trial phone number
    const updated = await prisma.businessCustomer.update({
      where: { id: business.id },
      data: {
        assignedPhoneNumber: twilioTrialNumber,
        numberProvisionedAt: new Date(),
      },
    })

    console.log(`✅ Successfully assigned Twilio trial number to ${business.businessName}`)
    console.log(`   Phone: ${updated.assignedPhoneNumber}`)
    console.log(`   Provisioned At: ${updated.numberProvisionedAt}`)
  } catch (error) {
    console.error('Error assigning trial number:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignTrialNumber()
