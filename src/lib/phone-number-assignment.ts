interface ZipCodeMapping {
  zipCode: string
  areaCode: string
  city: string
  state: string
}

interface PhoneNumber {
  id: string
  phoneNumber: string
  areaCode: string
  isAvailable: boolean
  assignedToZipCode?: string
  createdAt: Date
}

// Georgia area codes mapping (expand based on your service areas)
const GEORGIA_ZIP_TO_AREA_CODE: ZipCodeMapping[] = [
  // Atlanta Metro (404/470/678/770)
  { zipCode: '30301', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30302', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30303', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30304', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30305', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30306', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30307', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30308', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30309', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30310', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30311', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30312', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30313', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30314', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30315', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30316', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30317', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30318', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30319', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30324', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30326', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30327', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30328', areaCode: '404', city: 'Atlanta', state: 'GA' },
  { zipCode: '30329', areaCode: '404', city: 'Atlanta', state: 'GA' },

  // Marietta/Kennesaw (770)
  { zipCode: '30060', areaCode: '770', city: 'Marietta', state: 'GA' },
  { zipCode: '30062', areaCode: '770', city: 'Marietta', state: 'GA' },
  { zipCode: '30064', areaCode: '770', city: 'Marietta', state: 'GA' },
  { zipCode: '30066', areaCode: '770', city: 'Marietta', state: 'GA' },
  { zipCode: '30067', areaCode: '770', city: 'Marietta', state: 'GA' },
  { zipCode: '30068', areaCode: '770', city: 'Marietta', state: 'GA' },
  { zipCode: '30152', areaCode: '770', city: 'Kennesaw', state: 'GA' },

  // Gwinnett County (678/770)
  { zipCode: '30019', areaCode: '678', city: 'Dacula', state: 'GA' },
  { zipCode: '30024', areaCode: '678', city: 'Suwanee', state: 'GA' },
  { zipCode: '30043', areaCode: '678', city: 'Lawrenceville', state: 'GA' },
  { zipCode: '30044', areaCode: '678', city: 'Lawrenceville', state: 'GA' },
  { zipCode: '30045', areaCode: '678', city: 'Lawrenceville', state: 'GA' },
  { zipCode: '30046', areaCode: '678', city: 'Lawrenceville', state: 'GA' },
  { zipCode: '30047', areaCode: '678', city: 'Lilburn', state: 'GA' },
  { zipCode: '30096', areaCode: '678', city: 'Duluth', state: 'GA' },
  { zipCode: '30097', areaCode: '678', city: 'Duluth', state: 'GA' },
  { zipCode: '30518', areaCode: '678', city: 'Buford', state: 'GA' },

  // DeKalb County (470/404)
  { zipCode: '30021', areaCode: '470', city: 'Clarkston', state: 'GA' },
  { zipCode: '30030', areaCode: '470', city: 'Decatur', state: 'GA' },
  { zipCode: '30032', areaCode: '470', city: 'Decatur', state: 'GA' },
  { zipCode: '30033', areaCode: '470', city: 'Decatur', state: 'GA' },
  { zipCode: '30034', areaCode: '470', city: 'Decatur', state: 'GA' },
  { zipCode: '30035', areaCode: '470', city: 'Decatur', state: 'GA' },
  { zipCode: '30084', areaCode: '470', city: 'Tucker', state: 'GA' },
  { zipCode: '30087', areaCode: '470', city: 'Stone Mountain', state: 'GA' },
  { zipCode: '30088', areaCode: '470', city: 'Stone Mountain', state: 'GA' },

  // Cobb County (770/678)
  { zipCode: '30101', areaCode: '770', city: 'Acworth', state: 'GA' },
  { zipCode: '30102', areaCode: '770', city: 'Acworth', state: 'GA' },
  { zipCode: '30126', areaCode: '770', city: 'Mableton', state: 'GA' },
  { zipCode: '30127', areaCode: '770', city: 'Powder Springs', state: 'GA' },
  { zipCode: '30144', areaCode: '770', city: 'Kennesaw', state: 'GA' },
  { zipCode: '30168', areaCode: '770', city: 'Smyrna', state: 'GA' },
  { zipCode: '30080', areaCode: '770', city: 'Smyrna', state: 'GA' },
  { zipCode: '30082', areaCode: '770', city: 'Smyrna', state: 'GA' },
]

/**
 * Get area code for a given zip code
 */
export function getAreaCodeForZipCode(zipCode: string): string | null {
  const mapping = GEORGIA_ZIP_TO_AREA_CODE.find(m => m.zipCode === zipCode)
  return mapping?.areaCode || null
}

/**
 * Get location info for a zip code
 */
export function getLocationForZipCode(zipCode: string): ZipCodeMapping | undefined {
  return GEORGIA_ZIP_TO_AREA_CODE.find(m => m.zipCode === zipCode)
}

/**
 * Get all supported zip codes
 */
export function getSupportedZipCodes(): string[] {
  return GEORGIA_ZIP_TO_AREA_CODE.map(m => m.zipCode)
}

/**
 * Check if a zip code is supported
 */
export function isZipCodeSupported(zipCode: string): boolean {
  return GEORGIA_ZIP_TO_AREA_CODE.some(m => m.zipCode === zipCode)
}

/**
 * Get area codes for a specific city
 */
export function getAreaCodesForCity(city: string): string[] {
  const mappings = GEORGIA_ZIP_TO_AREA_CODE.filter(m =>
    m.city.toLowerCase() === city.toLowerCase()
  )
  return [...new Set(mappings.map(m => m.areaCode))]
}

/**
 * Mock phone number pool (in production, this would come from your SMS provider)
 */
const MOCK_PHONE_POOL: PhoneNumber[] = [
  // 404 numbers
  { id: '1', phoneNumber: '404-555-0101', areaCode: '404', isAvailable: true, createdAt: new Date() },
  { id: '2', phoneNumber: '404-555-0102', areaCode: '404', isAvailable: true, createdAt: new Date() },
  { id: '3', phoneNumber: '404-555-0103', areaCode: '404', isAvailable: true, createdAt: new Date() },

  // 470 numbers
  { id: '4', phoneNumber: '470-555-0101', areaCode: '470', isAvailable: true, createdAt: new Date() },
  { id: '5', phoneNumber: '470-555-0102', areaCode: '470', isAvailable: true, createdAt: new Date() },
  { id: '6', phoneNumber: '470-555-0103', areaCode: '470', isAvailable: true, createdAt: new Date() },

  // 678 numbers
  { id: '7', phoneNumber: '678-555-0101', areaCode: '678', isAvailable: true, createdAt: new Date() },
  { id: '8', phoneNumber: '678-555-0102', areaCode: '678', isAvailable: true, createdAt: new Date() },
  { id: '9', phoneNumber: '678-555-0103', areaCode: '678', isAvailable: true, createdAt: new Date() },

  // 770 numbers
  { id: '10', phoneNumber: '770-555-0101', areaCode: '770', isAvailable: true, createdAt: new Date() },
  { id: '11', phoneNumber: '770-555-0102', areaCode: '770', isAvailable: true, createdAt: new Date() },
  { id: '12', phoneNumber: '770-555-0103', areaCode: '770', isAvailable: true, createdAt: new Date() },
]

/**
 * Assign a phone number based on zip code
 */
export async function assignPhoneNumberForZipCode(zipCode: string): Promise<{
  success: boolean
  phoneNumber?: string
  areaCode?: string
  location?: ZipCodeMapping
  error?: string
}> {
  // Check if zip code is supported
  if (!isZipCodeSupported(zipCode)) {
    return {
      success: false,
      error: `Zip code ${zipCode} is not currently supported. We serve the Atlanta metro area.`
    }
  }

  // Get area code for zip code
  const areaCode = getAreaCodeForZipCode(zipCode)
  const location = getLocationForZipCode(zipCode)

  if (!areaCode) {
    return {
      success: false,
      error: 'Could not determine area code for zip code'
    }
  }

  // Find available phone number in that area code
  const availableNumber = MOCK_PHONE_POOL.find(
    phone => phone.areaCode === areaCode && phone.isAvailable
  )

  if (!availableNumber) {
    // Try to find a number in a nearby area code
    const fallbackAreaCodes = ['404', '470', '678', '770']
    const fallbackNumber = MOCK_PHONE_POOL.find(
      phone => fallbackAreaCodes.includes(phone.areaCode) && phone.isAvailable
    )

    if (!fallbackNumber) {
      return {
        success: false,
        error: 'No phone numbers available in your area. Please contact support.'
      }
    }

    // Assign fallback number
    fallbackNumber.isAvailable = false
    fallbackNumber.assignedToZipCode = zipCode

    return {
      success: true,
      phoneNumber: fallbackNumber.phoneNumber,
      areaCode: fallbackNumber.areaCode,
      location,
    }
  }

  // Assign the number
  availableNumber.isAvailable = false
  availableNumber.assignedToZipCode = zipCode

  return {
    success: true,
    phoneNumber: availableNumber.phoneNumber,
    areaCode,
    location,
  }
}

/**
 * Release a phone number back to the pool
 */
export async function releasePhoneNumber(phoneNumber: string): Promise<boolean> {
  const phone = MOCK_PHONE_POOL.find(p => p.phoneNumber === phoneNumber)
  if (phone) {
    phone.isAvailable = true
    phone.assignedToZipCode = undefined
    return true
  }
  return false
}

/**
 * Get available phone numbers for an area code
 */
export function getAvailableNumbers(areaCode: string): PhoneNumber[] {
  return MOCK_PHONE_POOL.filter(
    phone => phone.areaCode === areaCode && phone.isAvailable
  )
}

/**
 * Get phone number usage statistics
 */
export function getPhoneNumberStats() {
  const total = MOCK_PHONE_POOL.length
  const assigned = MOCK_PHONE_POOL.filter(p => !p.isAvailable).length
  const available = total - assigned

  const byAreaCode = MOCK_PHONE_POOL.reduce((acc, phone) => {
    if (!acc[phone.areaCode]) {
      acc[phone.areaCode] = { total: 0, assigned: 0, available: 0 }
    }
    acc[phone.areaCode].total++
    if (phone.isAvailable) {
      acc[phone.areaCode].available++
    } else {
      acc[phone.areaCode].assigned++
    }
    return acc
  }, {} as Record<string, { total: number; assigned: number; available: number }>)

  return {
    total,
    assigned,
    available,
    byAreaCode
  }
}