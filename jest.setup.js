import '@testing-library/jest-dom'

// Load environment variables from .env file
require('dotenv').config()

// Only set mock environment variables if they're not already defined
// This allows .env values to take precedence for integration tests
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret'
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
// Don't override DATABASE_URL - use the real Supabase connection for integration tests
// process.env.DATABASE_URL is loaded from .env via dotenv
process.env.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'test_account_sid'
process.env.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'test_auth_token'
process.env.TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890'
// Use test Stripe keys for unit tests (not integration tests)
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_unit_tests'
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock_secret'
// EZ Texting API configuration for tests
process.env.EZ_TEXTING_API_KEY = process.env.EZ_TEXTING_API_KEY || 'test_ez_texting_key'
process.env.EZ_TEXTING_API_URL = process.env.EZ_TEXTING_API_URL || 'https://api.eztexting.com/v2'

// Don't mock fetch globally - integration tests need to make real API calls
// Individual tests can mock fetch if needed
// global.fetch = jest.fn()

// Add TextEncoder/TextDecoder for Node.js environment (needed for Prisma)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

// Setup global test utilities
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks()
})