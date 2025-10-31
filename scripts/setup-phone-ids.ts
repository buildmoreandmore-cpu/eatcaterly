/**
 * Setup script to sync phone numbers and assign PhoneIDs to businesses
 * Run with: npx tsx scripts/setup-phone-ids.ts
 */

import { prisma } from '../src/lib/db'
import { fetchPhoneNumbers } from '../src/lib/ez-texting'

async function main() {
  console.log('🔄 Starting PhoneID setup...\n')

  // Step 1: Fetch phone numbers from EZTexting
  console.log('Step 1: Fetching phone numbers from EZTexting...')
  const result = await fetchPhoneNumbers()

  if (!result.success || !result.phones) {
    console.error('❌ Failed to fetch phone numbers:', result.error)
    process.exit(1)
  }

  console.log(`✅ Found ${result.phones.length} phone numbers:\n`)
  result.phones.forEach((phone, index) => {
    console.log(`  ${index + 1}. ${phone.Number} (PhoneID: ${phone.PhoneID}, Type: ${phone.Type})`)
  })

  // Step 2: Sync to database
  console.log('\nStep 2: Syncing to PhoneNumberInventory...')

  for (const phone of result.phones) {
    // Format phone number to E.164 format
    let formattedNumber = phone.Number.replace(/\D/g, '')
    if (formattedNumber.length === 10) {
      formattedNumber = `+1${formattedNumber}`
    } else if (formattedNumber.length === 11 && formattedNumber.startsWith('1')) {
      formattedNumber = `+${formattedNumber}`
    }

    const areaCode = formattedNumber.slice(-10, -7)

    try {
      await prisma.phoneNumberInventory.upsert({
        where: { ezTextingNumberId: phone.PhoneID },
        create: {
          phoneNumber: formattedNumber,
          ezTextingNumberId: phone.PhoneID,
          areaCode: areaCode,
          status: 'AVAILABLE',
          source: 'eztexting',
          notes: `Type: ${phone.Type}`
        },
        update: {
          phoneNumber: formattedNumber,
          notes: `Type: ${phone.Type}`
        }
      })
      console.log(`  ✅ Synced ${formattedNumber}`)
    } catch (error: any) {
      console.error(`  ❌ Failed to sync ${formattedNumber}:`, error.message)
    }
  }

  // Step 3: Show businesses that need PhoneIDs
  console.log('\nStep 3: Checking businesses...')
  const businesses = await prisma.businessCustomer.findMany({
    select: {
      id: true,
      businessName: true,
      assignedPhoneNumber: true,
      ezTextingNumberId: true,
      isActive: true
    }
  })

  console.log(`\nFound ${businesses.length} businesses:\n`)

  for (const business of businesses) {
    const status = business.ezTextingNumberId ? '✅ HAS PhoneID' : '❌ NEEDS PhoneID'
    console.log(`  ${status} - ${business.businessName}`)
    console.log(`    ID: ${business.id}`)
    console.log(`    Phone: ${business.assignedPhoneNumber || 'NOT ASSIGNED'}`)
    console.log(`    PhoneID: ${business.ezTextingNumberId || 'NOT SET'}`)
    console.log()
  }

  // Step 4: Auto-assign if phone numbers match
  console.log('Step 4: Auto-assigning PhoneIDs where phone numbers match...\n')

  for (const business of businesses) {
    if (business.ezTextingNumberId) {
      console.log(`  ⏭️  Skipping ${business.businessName} - already has PhoneID`)
      continue
    }

    if (!business.assignedPhoneNumber) {
      console.log(`  ⏭️  Skipping ${business.businessName} - no phone number assigned`)
      continue
    }

    // Try to find matching phone in inventory
    const phoneRecord = await prisma.phoneNumberInventory.findUnique({
      where: { phoneNumber: business.assignedPhoneNumber }
    })

    if (!phoneRecord || !phoneRecord.ezTextingNumberId) {
      console.log(`  ⚠️  Could not find PhoneID for ${business.assignedPhoneNumber}`)
      continue
    }

    // Assign the PhoneID
    try {
      await prisma.businessCustomer.update({
        where: { id: business.id },
        data: {
          ezTextingNumberId: phoneRecord.ezTextingNumberId,
          numberProvisionedAt: new Date()
        }
      })

      await prisma.phoneNumberInventory.update({
        where: { phoneNumber: business.assignedPhoneNumber },
        data: {
          status: 'ASSIGNED',
          currentBusinessId: business.id,
          assignedAt: new Date()
        }
      })

      console.log(`  ✅ Assigned PhoneID ${phoneRecord.ezTextingNumberId} to ${business.businessName}`)
    } catch (error: any) {
      console.log(`  ❌ Failed to assign: ${error.message}`)
    }
  }

  console.log('\n🎉 Setup complete!')

  // Final summary
  const updatedBusinesses = await prisma.businessCustomer.findMany({
    where: { ezTextingNumberId: { not: null } },
    select: { businessName: true, assignedPhoneNumber: true, ezTextingNumberId: true }
  })

  console.log(`\n📊 Summary:`)
  console.log(`   Total phone numbers in EZTexting: ${result.phones.length}`)
  console.log(`   Total businesses: ${businesses.length}`)
  console.log(`   Businesses with PhoneID configured: ${updatedBusinesses.length}`)

  if (updatedBusinesses.length > 0) {
    console.log(`\n✅ Ready to broadcast:`)
    updatedBusinesses.forEach(b => {
      console.log(`   - ${b.businessName}: ${b.assignedPhoneNumber} (PhoneID: ${b.ezTextingNumberId})`)
    })
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
