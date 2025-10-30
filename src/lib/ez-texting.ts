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

interface SendSMSParams {
  to: string
  from: string // Phone number for display/logging
  message: string
  phoneId?: string // EZTexting PhoneID for sending from specific number
}

interface SendSMSResult {
  success: boolean
  messageId?: string
  error?: string
}

interface EZTextingPhone {
  PhoneID: string
  Number: string
  Type: string // e.g., "Local", "TollFree"
}

interface EZTextingPhoneResponse {
  Response: {
    Status: string
    Entries: EZTextingPhone[]
  }
}

/**
 * Send an SMS message via EZTexting
 *
 * NOTE: EZ Texting does NOT support automated phone number provisioning via API.
 * Phone numbers must be manually acquired through the EZ Texting dashboard.
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
  const { to, from, message, phoneId } = params

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
    console.log('[EZTexting] API URL:', EZ_TEXTING_API_URL)
    console.log('[EZTexting] Has credentials:', { username: !!EZTEXTING_USERNAME, password: !!EZTEXTING_PASSWORD })

    // Build URL-encoded form data (EZTexting uses form data, not JSON)
    const formData = new URLSearchParams()
    formData.append('User', EZTEXTING_USERNAME)
    formData.append('Password', EZTEXTING_PASSWORD)
    formData.append('PhoneNumbers[]', formattedTo)
    formData.append('Message', message)

    // REQUIRE PhoneID - do not allow fallback to default number
    if (!phoneId) {
      console.error('[EZTexting] No PhoneID provided - broadcast rejected')
      return {
        success: false,
        error: 'PhoneID is required for sending SMS. Business must have ezTextingNumberId configured.',
      }
    }

    console.log('[EZTexting] Using PhoneID:', phoneId)
    formData.append('PhoneID', phoneId)

    // Subject for tracking/display purposes
    formData.append('Subject', 'Menu Broadcast')

    const apiUrl = `${EZ_TEXTING_API_URL}/sending/messages?format=json`
    console.log('[EZTexting] Fetching:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    console.log('[EZTexting] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
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
    console.error('[EZTexting] Exception while sending SMS:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
      name: error.name,
      code: error.code,
      type: error.constructor?.name
    })

    // Log the full error object for debugging
    console.error('[EZTexting] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))

    return {
      success: false,
      error: `${error.name || 'Error'}: ${error.message || 'Network error while sending SMS'}`,
    }
  }
}

/**
 * Fetch all phone numbers from EZTexting account
 * This retrieves the PhoneIDs needed for sending from specific numbers
 */
export async function fetchPhoneNumbers(): Promise<{ success: boolean; phones?: EZTextingPhone[]; error?: string }> {
  // Validate credentials exist
  if (!EZTEXTING_USERNAME || !EZTEXTING_PASSWORD) {
    return {
      success: false,
      error: 'EZTexting credentials not configured',
    }
  }

  try {
    const apiUrl = `${EZ_TEXTING_API_URL}/sending/phoneNumbers?format=json`
    console.log('[EZTexting] Fetching phone numbers from:', apiUrl)

    const formData = new URLSearchParams()
    formData.append('User', EZTEXTING_USERNAME)
    formData.append('Password', EZTEXTING_PASSWORD)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[EZTexting] Failed to fetch phone numbers:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      })

      return {
        success: false,
        error: `Failed to fetch phone numbers: ${response.status} ${response.statusText}`,
      }
    }

    const data: EZTextingPhoneResponse = await response.json()
    console.log('[EZTexting] Phone numbers fetched successfully:', data)

    if (data.Response?.Status === 'Success' && data.Response?.Entries) {
      return {
        success: true,
        phones: data.Response.Entries,
      }
    }

    return {
      success: false,
      error: 'No phone numbers found in response',
    }
  } catch (error: any) {
    console.error('[EZTexting] Exception while fetching phone numbers:', error)
    return {
      success: false,
      error: `Error: ${error.message || 'Network error'}`,
    }
  }
}

// EZ Texting only supports SMS sending via API
// Phone number management must be done manually through their dashboard
export default { sendSMS, fetchPhoneNumbers }
