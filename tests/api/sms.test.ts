import { sendSMS, processSMSResponse, broadcastMenu } from '@/lib/sms'

// Mock Twilio
jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}))

// Mock our database
jest.mock('@/lib/db', () => ({
  prisma: {
    smsLog: {
      create: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    menu: {
      findFirst: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
  },
}))

describe('SMS Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendSMS', () => {
    it('should send an SMS and log it', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ sid: 'SM123456' })
      const twilio = require('twilio')
      twilio.mockReturnValue({
        messages: { create: mockCreate },
      })

      const result = await sendSMS('+1234567890', 'Test message')

      expect(mockCreate).toHaveBeenCalledWith({
        body: 'Test message',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+1234567890',
      })
      expect(result).toEqual({ sid: 'SM123456' })
    })

    it('should handle SMS sending errors', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Twilio error'))
      const twilio = require('twilio')
      twilio.mockReturnValue({
        messages: { create: mockCreate },
      })

      await expect(sendSMS('+1234567890', 'Test message')).rejects.toThrow('Twilio error')
    })
  })

  describe('processSMSResponse', () => {
    it('should process a menu order request', async () => {
      const { prisma } = require('@/lib/db')

      prisma.customer.findUnique.mockResolvedValue({
        id: 'customer1',
        phoneNumber: '+1234567890',
        name: 'John Doe',
      })

      prisma.menu.findFirst.mockResolvedValue({
        id: 'menu1',
        date: new Date(),
        menuItems: [
          { id: 'item1', name: 'Chicken Alfredo', price: 1299 },
          { id: 'item2', name: 'Caesar Salad', price: 899 },
        ],
      })

      const response = await processSMSResponse('+1234567890', 'I want item 1')

      expect(response).toContain('Order received')
      expect(prisma.order.create).toHaveBeenCalled()
    })

    it('should handle new customer registration', async () => {
      const { prisma } = require('@/lib/db')

      prisma.customer.findUnique.mockResolvedValue(null)
      prisma.customer.create.mockResolvedValue({
        id: 'newcustomer',
        phoneNumber: '+1987654321',
        name: null,
      })

      const response = await processSMSResponse('+1987654321', 'Hello')

      expect(response).toContain('Welcome')
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: {
          phoneNumber: '+1987654321',
          isActive: true,
        },
      })
    })
  })

  describe('broadcastMenu', () => {
    it('should send menu to all active customers', async () => {
      const { prisma } = require('@/lib/db')

      prisma.customer.findMany.mockResolvedValue([
        { id: 'c1', phoneNumber: '+1111111111', name: 'Customer 1' },
        { id: 'c2', phoneNumber: '+2222222222', name: 'Customer 2' },
      ])

      prisma.menu.findFirst.mockResolvedValue({
        id: 'menu1',
        title: 'Today\'s Menu',
        menuItems: [
          { id: 'item1', name: 'Chicken Alfredo', price: 1299, description: 'Creamy pasta' },
        ],
      })

      const mockCreate = jest.fn().mockResolvedValue({ sid: 'SM123456' })
      const twilio = require('twilio')
      twilio.mockReturnValue({
        messages: { create: mockCreate },
      })

      const result = await broadcastMenu()

      expect(mockCreate).toHaveBeenCalledTimes(2)
      expect(result).toEqual({
        sent: 2,
        failed: 0,
        customers: ['+1111111111', '+2222222222'],
      })
    })
  })
})