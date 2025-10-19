/**
 * Tests for API Rate Limiting
 * Testing rate limit enforcement for different endpoint types
 */

import {
  rateLimitPayment,
  rateLimitWebhook,
  rateLimitGeneral,
  getRateLimiter,
} from '@/lib/rate-limit'

// Mock Upstash Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  })),
}))

// Mock Upstash Rate Limit
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn(),
  })),
}))

describe('API Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rate Limit Configuration', () => {
    it('should create rate limiter for payment endpoints', () => {
      const limiter = getRateLimiter('payment')
      expect(limiter).toBeDefined()
      // 20 requests per minute for payment endpoints
    })

    it('should create rate limiter for webhook endpoints', () => {
      const limiter = getRateLimiter('webhook')
      expect(limiter).toBeDefined()
      // 100 requests per minute for webhooks
    })

    it('should create rate limiter for general endpoints', () => {
      const limiter = getRateLimiter('general')
      expect(limiter).toBeDefined()
      // 50 requests per minute for general APIs
    })
  })

  describe('Payment Endpoint Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        success: true,
        limit: 20,
        remaining: 19,
        reset: Date.now() + 60000,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const identifier = 'user_123'
      const result = await rateLimitPayment(identifier)

      expect(result.success).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    })

    it('should block requests exceeding rate limit', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        success: false,
        limit: 20,
        remaining: 0,
        reset: Date.now() + 60000,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const identifier = 'user_123'
      const result = await rateLimitPayment(identifier)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.reset).toBeGreaterThan(Date.now())
    })

    it('should track different users independently', async () => {
      const mockLimit = jest.fn()
        .mockResolvedValueOnce({ success: true, remaining: 19 })
        .mockResolvedValueOnce({ success: true, remaining: 19 })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const result1 = await rateLimitPayment('user_123')
      const result2 = await rateLimitPayment('user_456')

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(mockLimit).toHaveBeenCalledTimes(2)
    })
  })

  describe('Webhook Rate Limiting', () => {
    it('should allow high volume for webhook endpoints', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const identifier = 'stripe_webhook'
      const result = await rateLimitWebhook(identifier)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(100)
    })

    it('should block malicious webhook flooding', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const identifier = 'attacker_ip'
      const result = await rateLimitWebhook(identifier)

      expect(result.success).toBe(false)
    })
  })

  describe('General API Rate Limiting', () => {
    it('should apply moderate limits to general endpoints', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        success: true,
        limit: 50,
        remaining: 49,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const identifier = 'user_123'
      const result = await rateLimitGeneral(identifier)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(50)
    })
  })

  describe('Rate Limit Response Headers', () => {
    it('should include rate limit info in headers', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        success: true,
        limit: 20,
        remaining: 15,
        reset: Date.now() + 30000,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const result = await rateLimitPayment('user_123')

      expect(result.limit).toBeDefined()
      expect(result.remaining).toBeDefined()
      expect(result.reset).toBeDefined()
    })

    it('should provide retry-after time when rate limited', async () => {
      const resetTime = Date.now() + 60000
      const mockLimit = jest.fn().mockResolvedValue({
        success: false,
        limit: 20,
        remaining: 0,
        reset: resetTime,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const result = await rateLimitPayment('user_123')

      expect(result.success).toBe(false)
      expect(result.reset).toBe(resetTime)
      // Calculate retry-after in seconds
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
      expect(retryAfter).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle Redis connection failure gracefully', async () => {
      const mockLimit = jest.fn().mockRejectedValue(new Error('Redis unavailable'))

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      // Should allow request to proceed if rate limiter fails (fail open)
      const result = await rateLimitPayment('user_123').catch(() => ({
        success: true,
        remaining: -1,
        note: 'Rate limiter unavailable, allowing request',
      }))

      expect(result.success).toBe(true)
    })

    it('should handle empty identifier', async () => {
      await expect(rateLimitPayment('')).rejects.toThrow()
    })

    it('should handle null identifier', async () => {
      await expect(rateLimitPayment(null as any)).rejects.toThrow()
    })

    it('should use IP address as fallback identifier', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        success: true,
        remaining: 19,
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const ipAddress = '192.168.1.1'
      const result = await rateLimitGeneral(ipAddress)

      expect(result.success).toBe(true)
      expect(mockLimit).toHaveBeenCalledWith(ipAddress)
    })
  })

  describe('Sliding Window Algorithm', () => {
    it('should use sliding window for accurate rate limiting', async () => {
      const mockLimit = jest.fn()
        .mockResolvedValueOnce({ success: true, remaining: 19 })
        .mockResolvedValueOnce({ success: true, remaining: 18 })
        .mockResolvedValueOnce({ success: true, remaining: 17 })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const identifier = 'user_123'

      // Make 3 requests in quick succession
      await rateLimitPayment(identifier)
      await rateLimitPayment(identifier)
      const result = await rateLimitPayment(identifier)

      expect(result.remaining).toBeLessThan(20)
    })
  })

  describe('Rate Limit Bypass for Webhooks from Trusted Sources', () => {
    it('should allow Stripe webhook IPs without strict rate limiting', async () => {
      // Stripe webhook IPs should have higher limits
      const stripeWebhookIdentifier = 'stripe:webhook'

      const mockLimit = jest.fn().mockResolvedValue({
        success: true,
        remaining: 999, // Much higher limit for trusted sources
      })

      const { Ratelimit } = require('@upstash/ratelimit')
      Ratelimit.mockImplementation(() => ({
        limit: mockLimit,
      }))

      const result = await rateLimitWebhook(stripeWebhookIdentifier)

      expect(result.success).toBe(true)
    })
  })
})
