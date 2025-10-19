/**
 * EZ Texting API Client
 * Handles phone number provisioning and management
 */

const EZ_TEXTING_API_URL = process.env.EZ_TEXTING_API_URL || 'https://api.eztexting.com/v2'
const EZ_TEXTING_API_KEY = process.env.EZ_TEXTING_API_KEY

// Atlanta area code fallbacks (404 → 470 → 678 → 770)
const AREA_CODE_FALLBACKS: Record<string, string[]> = {
  '404': ['470', '678', '770'],
  '470': ['404', '678', '770'],
  '678': ['404', '470', '770'],
  '770': ['404', '470', '678'],
}

interface ProvisionResult {
  success: boolean
  phoneNumber?: string
  numberId?: string
  areaCode?: string
  fallbackUsed?: boolean
  error?: string
}

interface ReleaseResult {
  success: boolean
  error?: string
}

interface DetailsResult {
  success: boolean
  phoneNumber?: string
  numberId?: string
  areaCode?: string
  status?: string
  monthlyPrice?: number
  error?: string
}

/**
 * Provision a phone number from EZ Texting with area code fallback
 */
async function provisionPhoneNumber(requestedAreaCode: string): Promise<ProvisionResult> {
  if (!EZ_TEXTING_API_KEY) {
    return {
      success: false,
      error: 'EZ Texting API key not configured',
    }
  }

  // Try requested area code first
  const areaCodesToTry = [requestedAreaCode, ...(AREA_CODE_FALLBACKS[requestedAreaCode] || [])]

  for (let i = 0; i < areaCodesToTry.length; i++) {
    const areaCode = areaCodesToTry[i]
    const fallbackUsed = i > 0

    try {
      const response = await fetch(`${EZ_TEXTING_API_URL}/available-numbers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EZ_TEXTING_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          areaCode,
          quantity: 1,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          phoneNumber: data.phoneNumber,
          numberId: data.numberId,
          areaCode: data.areaCode,
          fallbackUsed,
        }
      }

      // Handle authentication errors immediately
      if (response.status === 401) {
        return {
          success: false,
          error: 'EZ Texting authentication failed. Please check API credentials.',
        }
      }

      // If 404 (no numbers available), try next area code
      if (response.status === 404) {
        continue
      }

      // Other errors
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || `Failed to provision number: ${response.status}`,
      }
    } catch (error: any) {
      // Network error - if not last attempt, try next area code
      if (i < areaCodesToTry.length - 1) {
        continue
      }

      return {
        success: false,
        error: error.message || 'Network error while provisioning phone number',
      }
    }
  }

  // All area codes exhausted
  return {
    success: false,
    error: `No available phone numbers in area codes: ${areaCodesToTry.join(', ')}`,
  }
}

/**
 * Release a phone number back to EZ Texting
 */
async function releasePhoneNumber(numberId: string): Promise<ReleaseResult> {
  if (!EZ_TEXTING_API_KEY) {
    return {
      success: false,
      error: 'EZ Texting API key not configured',
    }
  }

  try {
    const response = await fetch(`${EZ_TEXTING_API_URL}/numbers/${numberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${EZ_TEXTING_API_KEY}`,
      },
    })

    if (response.ok) {
      return { success: true }
    }

    const errorData = await response.json().catch(() => ({}))
    return {
      success: false,
      error: errorData.error || `Failed to release number: ${response.status}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error while releasing phone number',
    }
  }
}

/**
 * List all phone numbers in your EZTexting account
 */
async function listPhoneNumbers(): Promise<{
  success: boolean
  numbers?: Array<{
    phoneNumber: string
    numberId: string
    areaCode: string
    status: string
    monthlyPrice?: number
  }>
  error?: string
}> {
  if (!EZ_TEXTING_API_KEY) {
    return {
      success: false,
      error: 'EZ Texting API key not configured',
    }
  }

  try {
    const response = await fetch(`${EZ_TEXTING_API_URL}/numbers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EZ_TEXTING_API_KEY}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        numbers: data.numbers || [],
      }
    }

    const errorData = await response.json().catch(() => ({}))
    return {
      success: false,
      error: errorData.error || `Failed to list numbers: ${response.status}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error while listing phone numbers',
    }
  }
}

/**
 * Get details about a provisioned phone number
 */
async function getPhoneNumberDetails(numberId: string): Promise<DetailsResult> {
  if (!EZ_TEXTING_API_KEY) {
    return {
      success: false,
      error: 'EZ Texting API key not configured',
    }
  }

  try {
    const response = await fetch(`${EZ_TEXTING_API_URL}/numbers/${numberId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EZ_TEXTING_API_KEY}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        phoneNumber: data.phoneNumber,
        numberId: data.numberId,
        areaCode: data.areaCode,
        status: data.status,
        monthlyPrice: data.monthlyPrice,
      }
    }

    const errorData = await response.json().catch(() => ({}))
    return {
      success: false,
      error: errorData.error || `Failed to get number details: ${response.status}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error while fetching phone number details',
    }
  }
}

const ezTexting = {
  provisionPhoneNumber,
  releasePhoneNumber,
  getPhoneNumberDetails,
  listPhoneNumbers,
}

export default ezTexting
