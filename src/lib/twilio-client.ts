import { env } from './env'
import twilio from 'twilio'

/**
 * Twilio SMS Client
 *
 * Handles all SMS sending functionality using the Twilio API.
 * Replaces the previous EZTexting integration.
 */

// Initialize Twilio client
const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

export interface SendSMSResult {
  success: boolean
  messageId?: string
  error?: string
  errorCode?: string
}

/**
 * Send an SMS message via Twilio
 *
 * @param to - Recipient phone number in E.164 format (e.g., +14045551234)
 * @param message - SMS message content
 * @returns SendSMSResult with success status and message ID or error
 */
export async function sendSMS(
  to: string,
  message: string
): Promise<SendSMSResult> {
  try {
    // Ensure phone number is in E.164 format
    const formattedTo = formatPhoneNumber(to)

    // Send SMS via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    })

    return {
      success: true,
      messageId: twilioMessage.sid,
    }
  } catch (error: any) {
    console.error('Twilio SMS Error:', error)

    return {
      success: false,
      error: error.message || 'Failed to send SMS',
      errorCode: error.code?.toString() || 'UNKNOWN_ERROR',
    }
  }
}

/**
 * Format phone number to E.164 format
 *
 * Twilio requires phone numbers in E.164 format (+1XXXXXXXXXX)
 * This function ensures the number has the correct format.
 *
 * @param phoneNumber - Phone number in various formats
 * @returns Phone number in E.164 format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')

  // If already has country code (11 digits), add + prefix
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // If 10 digits, assume US number and add +1 prefix
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // If already formatted, return as-is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber
  }

  // Fallback: return with + prefix
  return `+${digits}`
}

/**
 * Validate that a phone number is in E.164 format
 *
 * @param phoneNumber - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidE164(phoneNumber: string): boolean {
  // E.164 format: +[country code][number]
  // US numbers: +1XXXXXXXXXX (12 characters total)
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(phoneNumber)
}

export default {
  sendSMS,
  formatPhoneNumber,
  isValidE164,
}
