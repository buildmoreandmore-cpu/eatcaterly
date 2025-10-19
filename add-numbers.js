const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addNumbers() {
  try {
    // Your two numbers from EZTexting
    const numbers = [
      {
        phoneNumber: '+13217806128',
        areaCode: '321',
        ezTextingNumberId: 'ez_321_6128', // Placeholder - will update when we sync
      },
      {
        phoneNumber: '+14702562470',
        areaCode: '470',
        ezTextingNumberId: 'ez_470_2470', // Placeholder - will update when we sync
      },
    ]

    for (const number of numbers) {
      // Check if already exists
      const existing = await prisma.phoneNumberInventory.findUnique({
        where: { phoneNumber: number.phoneNumber },
      })

      if (existing) {
        console.log(`✓ Number ${number.phoneNumber} already exists`)
        continue
      }

      // Create the number
      const created = await prisma.phoneNumberInventory.create({
        data: {
          phoneNumber: number.phoneNumber,
          areaCode: number.areaCode,
          ezTextingNumberId: number.ezTextingNumberId,
          status: 'AVAILABLE',
          source: 'eztexting',
          monthlyPrice: 0, // Update this with actual price if needed
          purchasedAt: new Date(),
        },
      })

      console.log(`✓ Added ${number.phoneNumber} to inventory`)
    }

    console.log('\n✅ Done! Check your phone inventory page.')
  } catch (error) {
    console.error('Error adding numbers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addNumbers()
