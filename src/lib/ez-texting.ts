/**
 * EZ Texting API Client
 * Handles phone number provisioning and management
 */

const EZ_TEXTING_API_URL = process.env.EZ_TEXTING_API_URL || 'https://api.eztexting.com/v2'
const EZTEXTING_ACCESS_TOKEN = process.env.EZTEXTING_ACCESS_TOKEN || process.env.EZ_TEXTING_API_KEY

// Create Bearer token auth header
function getAuthHeader(): string {
  if (!EZTEXTING_ACCESS_TOKEN) {
    throw new Error('EZTexting access token not configured')
  }

  return `Bearer ${EZTEXTING_ACCESS_TOKEN}`
}

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

interface SendSMSParams {
  to: string
  from: string
  message: string
}

interface SendSMSResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Provision a phone number from EZ Texting with area code fallback
 */
async function provisionPhoneNumber(requestedAreaCode: string): Promise<ProvisionResult> {
  try {
    getAuthHeader() // Validate credentials exist
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'EZTexting credentials not configured',
    }
  }

  // Try requested area code first
  const areaCodesToTry = [requestedAreaCode, ...(AREA_CODE_FALLBACKS[requestedAreaCode] || [])]

  for (let i = 0; i < areaCodesToTry.length; i++) {
    const areaCode = areaCodesToTry[i]
    const fallbackUsed = i > 0

    try {
      const response = await fetch(`${EZ_TEXTING_API_URL}/sending/numbers`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
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
  try {
    getAuthHeader() // Validate credentials exist
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'EZTexting credentials not configured',
    }
  }

  try {
    const response = await fetch(`${EZ_TEXTING_API_URL}/numbers/${numberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthHeader(),
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
  try {
    getAuthHeader() // Validate credentials exist
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'EZTexting credentials not configured',
    }
  }

  try {
    const response = await fetch(`${EZ_TEXTING_API_URL}/numbers`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
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
  try {
    getAuthHeader() // Validate credentials exist
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'EZTexting credentials not configured',
    }
  }

  try {
    const response = await fetch(`${EZ_TEXTING_API_URL}/numbers/${numberId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
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

/**
 * Send an SMS message via EZTexting v2 API
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
  const { to, from, message } = params

  // Validate credentials exist
  try {
    getAuthHeader() // Will throw if token not configured
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'EZTexting access token not configured',
    }
  }

  try {
    // Format phone numbers to E.164 format (v2 API expects +1XXXXXXXXXX)
    const formatPhoneNumber = (phone: string): string => {
      // Remove all non-digit characters
      const digitsOnly = phone.replace(/\D/g, '')

      // If it starts with 1 and has 11 digits, add +
      if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return `+${digitsOnly}`
      }

      // If it has 10 digits, add +1
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`
      }

      // Otherwise, try to add +1 prefix
      return `+1${digitsOnly}`
    }

    const formattedTo = formatPhoneNumber(to)
    const formattedFrom = formatPhoneNumber(from)

    console.log('[EZTexting] Sending SMS via v2 API:', { to: formattedTo, from: formattedFrom, messageLength: message.length })

    // Use v2 API with JSON and Bearer token
    const response = await fetch(`${EZ_TEXTING_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedTo,
        from: formattedFrom,
        body: message,
      }),
    })

    if (!response.ok) {
      // Try to parse error response
      const errorText = await response.text()
      console.error('[EZTexting] SMS send failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        to: formattedTo,
        from: formattedFrom
      })

      // Handle authentication errors
      if (response.status === 401) {
        return {
          success: false,
          error: 'EZ Texting authentication failed. Please check API access token.',
        }
      }

      return {
        success: false,
        error: `Failed to send SMS: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()
    console.log('[EZTexting] SMS sent successfully:', data)

    return {
      success: true,
      messageId: data.id || data.messageId || 'unknown',
    }
  } catch (error: any) {
    console.error('[EZTexting] Exception while sending SMS:', error)
    return {
      success: false,
      error: error.message || 'Network error while sending SMS',
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
