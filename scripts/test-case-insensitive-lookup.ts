import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testLookup() {
  const testEmails = [
    'martin@homeowner-support.com',  // lowercase
    'Martin@homeowner-support.com',  // capital M
    'MARTIN@HOMEOWNER-SUPPORT.COM',  // all caps
    'mfessbar@gmail.com',
    'MFESSBAR@GMAIL.COM',
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
      select: { id: true, contactEmail: true, businessName: true }
    })

    if (business) {
      console.log('✅ Found:', business.businessName)
      console.log('   Stored email:', business.contactEmail)
      console.log('   Business ID:', business.id)
    } else {
      console.log('❌ Not found')
    }
  }

  await prisma.$disconnect()
}

testLookup()
