// Demo mode utilities for when external services aren't configured

export const isDemoMode = () => {
  // Force demo mode for SMS due to A2P registration requirements
  // while keeping SMS logs functionality
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