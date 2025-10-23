/**
 * EZ Texting API Client
 * Handles phone number provisioning and management
 */

const EZ_TEXTING_API_URL = process.env.EZ_TEXTING_API_URL || 'https://app.eztexting.com'
const EZTEXTING_USERNAME = process.env.EZTEXTING_USERNAME
const EZTEXTING_PASSWORD = process.env.EZTEXTING_PASSWORD

// Create Basic Auth header
function getAuthHeader(): string {
  if (!EZTEXTING_USERNAME || !EZTEXTING_PASSWORD) {
    throw new Error('EZTexting credentials not configured')
  }

  // Use Buffer in Node.js environment (API routes)
  if (typeof Buffer !== 'undefined') {
    const credentials = Buffer.from(`${EZTEXTING_USERNAME}:${EZTEXTING_PASSWORD}`).toString('base64')
    return `Basic ${credentials}`
  }

  // Fallback for environments without Buffer
  const credentials = btoa(`${EZTEXTING_USERNAME}:${EZTEXTING_PASSWORD}`)
  return `Basic ${credentials}`
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
 * Send an SMS message via EZTexting
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
  const { to, from, message } = params

  // Validate credentials exist
  if (!EZTEXTING_USERNAME || !EZTEXTING_PASSWORD) {
    return {
      success: false,
      error: 'EZTexting credentials not configured',
    }
  }

  try {
    // Format phone numbers to 10-digit format (EZTexting expects 10 digits, no +1)
    const formatPhoneNumber = (phone: string): string => {
      // Remove all non-digit characters
      const digitsOnly = phone.replace(/\D/g, '')

      // If it starts with 1 and has 11 digits, remove the 1
      if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return digitsOnly.substring(1)
      }

      // If it has 10 digits, use as is
      if (digitsOnly.length === 10) {
        return digitsOnly
      }

      // Otherwise, return the digits as is (may cause API error, but will be logged)
      return digitsOnly
    }

    const formattedTo = formatPhoneNumber(to)
    const formattedFrom = formatPhoneNumber(from)

    console.log('[EZTexting] Sending SMS:', { to: formattedTo, from: formattedFrom, messageLength: message.length })

    // Build URL-encoded form data (EZTexting uses form data, not JSON)
    const formData = new URLSearchParams()
    formData.append('User', EZTEXTING_USERNAME)
    formData.append('Password', EZTEXTING_PASSWORD)
    formData.append('PhoneNumbers[]', formattedTo)
    formData.append('Message', message)
    formData.append('Subject', formattedFrom) // Subject shows as sender on some carriers

    const response = await fetch(`${EZ_TEXTING_API_URL}/sending/messages?format=json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
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
          error: 'EZ Texting authentication failed. Please check API credentials.',
        }
      }

      return {
        success: false,
        error: `Failed to send SMS: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()
    console.log('[EZTexting] SMS sent successfully:', data)

    // Check for errors in the response
    if (data.Response?.Status === 'Failure' || data.Response?.Errors) {
      const errorMsg = data.Response?.Errors?.[0]?.Message || 'Unknown error from EZTexting'
      console.error('[EZTexting] API returned error:', errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    }

    return {
      success: true,
      messageId: data.Response?.Entry?.MessageID || data.Entry?.MessageID || 'unknown',
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
