/**
 * @jest-environment node
 */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Mock fetch globally for this test file
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

describe('EZ Texting API Client', () => {
  let ezTexting: any

  beforeEach(async () => {
    // Import fresh module for each test
    jest.resetModules()
    const module = await import('@/lib/ez-texting')
    ezTexting = module.default

    // Clear fetch mock before each test
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('provisionPhoneNumber', () => {
    test('should successfully provision a phone number for requested area code', async () => {
      // Mock successful EZ Texting API response
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          phoneNumber: '+14045551234',
          numberId: 'eztn_123456',
          areaCode: '404',
          monthlyPrice: 30,
        }),
      } as Response)

      const result = await ezTexting.provisionPhoneNumber('404')

      expect(result.success).toBe(true)
      expect(result.phoneNumber).toBe('+14045551234')
      expect(result.numberId).toBe('eztn_123456')
      expect(result.areaCode).toBe('404')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/available-numbers'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.any(String),
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('404'),
        })
      )
    })

    test('should try fallback area codes when requested area code is unavailable', async () => {
      // First call: requested area code 404 is out of stock
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'No available numbers in area code 404',
        }),
      } as Response)

      // Second call: fallback to 470 succeeds
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          phoneNumber: '+14705551234',
          numberId: 'eztn_789012',
          areaCode: '470',
          monthlyPrice: 30,
        }),
      } as Response)

      const result = await ezTexting.provisionPhoneNumber('404')

      expect(result.success).toBe(true)
      expect(result.phoneNumber).toBe('+14705551234')
      expect(result.areaCode).toBe('470')
      expect(result.fallbackUsed).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    test('should return error when all area codes are unavailable', async () => {
      // Mock all area code attempts failing (404 has 3 fallbacks: 470, 678, 770)
      ;(global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'No available numbers' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'No available numbers' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'No available numbers' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'No available numbers' }),
        } as Response)

      const result = await ezTexting.provisionPhoneNumber('404')

      expect(result.success).toBe(false)
      expect(result.error).toContain('No available phone numbers')
      expect(global.fetch).toHaveBeenCalledTimes(4) // Original (404) + 3 fallbacks (470, 678, 770)
    })

    test('should handle API authentication errors', async () => {
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'Invalid API key',
        }),
      } as Response)

      const result = await ezTexting.provisionPhoneNumber('404')

      expect(result.success).toBe(false)
      expect(result.error).toContain('authentication')
    })

    test('should handle network errors', async () => {
      // Mock all 4 area code attempts (404 + 3 fallbacks) to fail with network error
      ;(global.fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))

      const result = await ezTexting.provisionPhoneNumber('404')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('releasePhoneNumber', () => {
    test('should successfully release a phone number', async () => {
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Phone number released',
        }),
      } as Response)

      const result = await ezTexting.releasePhoneNumber('eztn_123456')

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/numbers/eztn_123456'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      )
    })

    test('should handle release errors gracefully', async () => {
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Number not found',
        }),
      } as Response)

      const result = await ezTexting.releasePhoneNumber('eztn_invalid')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getPhoneNumberDetails', () => {
    test('should retrieve phone number details', async () => {
      ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          phoneNumber: '+14045551234',
          numberId: 'eztn_123456',
          areaCode: '404',
          status: 'active',
          monthlyPrice: 30,
        }),
      } as Response)

      const result = await ezTexting.getPhoneNumberDetails('eztn_123456')

      expect(result.success).toBe(true)
      expect(result.phoneNumber).toBe('+14045551234')
      expect(result.status).toBe('active')
    })
  })
})
