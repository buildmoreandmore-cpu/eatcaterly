/**
 * Phone Number Inventory Management
 * Handles number recycling, assignment, and tracking
 */

import { prisma } from './db'

const COOLDOWN_DAYS = 30 // Days before number can be reassigned

export interface InventoryNumber {
  id: string
  phoneNumber: string
  areaCode: string
  status: string
  currentBusinessId?: string | null
  previousBusinessId?: string | null
  monthlyPrice?: number | null
  cooldownUntil?: Date | null
}

/**
 * Get available number for specific area code
 * Priority: 1) Available inventory 2) Cooldown expired 3) Purchase new
 */
export async function getAvailableNumber(areaCode: string): Promise<{
  success: boolean
  number?: InventoryNumber
  source?: 'inventory' | 'cooldown' | 'new_purchase'
  error?: string
}> {
  try {
    // 1. Check for available numbers in inventory
    const availableNumber = await prisma.phoneNumberInventory.findFirst({
      where: {
        areaCode,
        status: 'AVAILABLE',
      },
      orderBy: {
        releasedAt: 'asc', // Oldest released first
      },
    })

    if (availableNumber) {
      return {
        success: true,
        number: availableNumber as InventoryNumber,
        source: 'inventory',
      }
    }

    // 2. Check for numbers past cooldown period
    const now = new Date()
    const cooldownExpired = await prisma.phoneNumberInventory.findFirst({
      where: {
        areaCode,
        status: 'COOLDOWN',
        cooldownUntil: {
          lte: now,
        },
      },
      orderBy: {
        cooldownUntil: 'asc',
      },
    })

    if (cooldownExpired) {
      // Mark as available
      const updated = await prisma.phoneNumberInventory.update({
        where: { id: cooldownExpired.id },
        data: { status: 'AVAILABLE' },
      })

      return {
        success: true,
        number: updated as InventoryNumber,
        source: 'cooldown',
      }
    }

    // 3. No available numbers - need to purchase new one
    return {
      success: false,
      error: 'No available numbers in inventory. Purchase new number.',
    }
  } catch (error: any) {
    console.error('Error getting available number:', error)
    return {
      success: false,
      error: error.message || 'Failed to get available number',
    }
  }
}

/**
 * Assign phone number to business
 */
export async function assignNumber(
  phoneNumberId: string,
  businessId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await prisma.phoneNumberInventory.update({
      where: { id: phoneNumberId },
      data: {
        status: 'ASSIGNED',
        currentBusinessId: businessId,
        assignedAt: new Date(),
        cooldownUntil: null, // Clear cooldown
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error assigning number:', error)
    return {
      success: false,
      error: error.message || 'Failed to assign number',
    }
  }
}

/**
 * Release phone number (put into cooldown)
 */
export async function releaseNumber(phoneNumber: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const number = await prisma.phoneNumberInventory.findUnique({
      where: { phoneNumber },
    })

    if (!number) {
      return {
        success: false,
        error: 'Phone number not found in inventory',
      }
    }

    const cooldownUntil = new Date()
    cooldownUntil.setDate(cooldownUntil.getDate() + COOLDOWN_DAYS)

    await prisma.phoneNumberInventory.update({
      where: { phoneNumber },
      data: {
        status: 'COOLDOWN',
        previousBusinessId: number.currentBusinessId,
        currentBusinessId: null,
        releasedAt: new Date(),
        cooldownUntil,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error releasing number:', error)
    return {
      success: false,
      error: error.message || 'Failed to release number',
    }
  }
}

/**
 * Add new number to inventory (from EZTexting purchase)
 */
export async function addToInventory(params: {
  phoneNumber: string
  ezTextingNumberId: string
  areaCode: string
  monthlyPrice?: number
}): Promise<{
  success: boolean
  inventoryId?: string
  error?: string
}> {
  try {
    const number = await prisma.phoneNumberInventory.create({
      data: {
        phoneNumber: params.phoneNumber,
        ezTextingNumberId: params.ezTextingNumberId,
        areaCode: params.areaCode,
        monthlyPrice: params.monthlyPrice,
        status: 'AVAILABLE',
        source: 'eztexting',
        purchasedAt: new Date(),
      },
    })

    return {
      success: true,
      inventoryId: number.id,
    }
  } catch (error: any) {
    console.error('Error adding to inventory:', error)
    return {
      success: false,
      error: error.message || 'Failed to add number to inventory',
    }
  }
}

/**
 * Sync all numbers from Twilio to inventory
 * Note: This function is kept for compatibility but Twilio phone number
 * management is typically done manually or through the Twilio console.
 * You can extend this to use the Twilio API if needed.
 */
export async function syncWithTwilio(): Promise<{
  success: boolean
  added: number
  updated: number
  error?: string
}> {
  try {
    // Twilio phone number management is typically done through the console
    // This function is a placeholder for future automation
    console.log('Twilio phone number sync is not yet implemented.')
    console.log('Please manage phone numbers through the Twilio console.')

    return {
      success: true,
      added: 0,
      updated: 0,
    }
  } catch (error: any) {
    console.error('Error syncing with Twilio:', error)
    return {
      success: false,
      added: 0,
      updated: 0,
      error: error.message || 'Failed to sync with Twilio',
    }
  }
}

// Keep old function name for backward compatibility
export const syncWithEZTexting = syncWithTwilio

/**
 * Get inventory statistics
 */
export async function getInventoryStats(): Promise<{
  total: number
  available: number
  assigned: number
  cooldown: number
  reserved: number
  byAreaCode: Record<string, { total: number; available: number; assigned: number }>
}> {
  const allNumbers = await prisma.phoneNumberInventory.findMany()

  const stats = {
    total: allNumbers.length,
    available: allNumbers.filter(n => n.status === 'AVAILABLE').length,
    assigned: allNumbers.filter(n => n.status === 'ASSIGNED').length,
    cooldown: allNumbers.filter(n => n.status === 'COOLDOWN').length,
    reserved: allNumbers.filter(n => n.status === 'RESERVED').length,
    byAreaCode: {} as Record<string, { total: number; available: number; assigned: number }>,
  }

  // Calculate stats by area code
  for (const number of allNumbers) {
    if (!stats.byAreaCode[number.areaCode]) {
      stats.byAreaCode[number.areaCode] = { total: 0, available: 0, assigned: 0 }
    }
    stats.byAreaCode[number.areaCode].total++
    if (number.status === 'AVAILABLE') {
      stats.byAreaCode[number.areaCode].available++
    }
    if (number.status === 'ASSIGNED') {
      stats.byAreaCode[number.areaCode].assigned++
    }
  }

  return stats
}

/**
 * Search inventory by criteria
 */
export async function searchInventory(params: {
  areaCode?: string
  status?: string
  previousBusinessId?: string
  search?: string
}): Promise<InventoryNumber[]> {
  const where: any = {}

  if (params.areaCode) {
    where.areaCode = params.areaCode
  }

  if (params.status) {
    where.status = params.status
  }

  if (params.previousBusinessId) {
    where.previousBusinessId = params.previousBusinessId
  }

  if (params.search) {
    where.phoneNumber = {
      contains: params.search,
    }
  }

  const numbers = await prisma.phoneNumberInventory.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return numbers as InventoryNumber[]
}

/**
 * Reassign phone number from one business to another
 */
export async function reassignNumber(params: {
  phoneNumberId: string
  fromBusinessId: string
  toBusinessId: string
}): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { phoneNumberId, fromBusinessId, toBusinessId } = params

    // Update inventory to reflect reassignment
    await prisma.phoneNumberInventory.update({
      where: { id: phoneNumberId },
      data: {
        previousBusinessId: fromBusinessId,
        currentBusinessId: toBusinessId,
        assignedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error reassigning number:', error)
    return {
      success: false,
      error: error.message || 'Failed to reassign number',
    }
  }
}
