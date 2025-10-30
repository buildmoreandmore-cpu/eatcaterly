// Demo mode utilities for when external services aren't configured

export const isDemoMode = () => {
  // Allow tests to bypass demo mode
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return false
  }

  // Check if Stripe is configured - if yes, disable demo mode
  // This allows real Stripe payments while keeping SMS in demo mode for A2P registration
  if (process.env.STRIPE_SECRET_KEY) {
    return false
  }

  // Force demo mode if Stripe is not configured
  return true
}

// Separate demo mode check for SMS with auto-detection of credentials
export const isSMSDemoMode = () => {
  // Allow tests to bypass demo mode
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return false
  }

  // Auto-detect based on EZtexting credentials
  const hasBasicAuth = process.env.EZTEXTING_USERNAME && process.env.EZTEXTING_PASSWORD
  const hasApiAuth = process.env.EZTEXTING_APP_KEY && process.env.EZTEXTING_APP_SECRET
  const hasOAuthTokens = process.env.EZTEXTING_ACCESS_TOKEN && process.env.EZTEXTING_REFRESH_TOKEN

  // If any credential set is present, disable demo mode (use real SMS)
  // If no credentials present, enable demo mode (safe fallback)
  return !(hasBasicAuth || hasApiAuth || hasOAuthTokens)
}

export const demoSMSResult = {
  sid: 'demo_sms_12345',
  status: 'sent'
}

export const demoPaymentResult = {
  paymentLinkId: 'demo_payment_link_12345',
  url: 'https://demo-payment-link.example.com'
}

export const demoWebhookResult = {
  success: true,
  message: 'Demo webhook processed'
}