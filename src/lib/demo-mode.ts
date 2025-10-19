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

// Separate demo mode check for SMS (always true for A2P registration requirements)
export const isSMSDemoMode = () => {
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return false
  }
  // Force SMS demo mode due to A2P registration requirements
  return true
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