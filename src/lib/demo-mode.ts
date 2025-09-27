// Demo mode utilities for when external services aren't configured

export const isDemoMode = () => {
  return !process.env.TWILIO_ACCOUNT_SID || !process.env.STRIPE_SECRET_KEY
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