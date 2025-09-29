import { NextRequest } from 'next/server'
import { POST, DELETE } from './route'

// Mock Prisma
const mockPrisma = {
  customerList: {
    findUnique: jest.fn(),
  },
  customer: {
    findMany: jest.fn(),
  },
  customerListMember: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

describe('/api/customer-lists/[id]/members API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/customer-lists/[id]/members', () => {
    it('should add members to a customer list successfully', async () => {
      const customerListId = 'list-123'
      const customerIds = ['customer-1', 'customer-2']

      // Mock customer list exists
      mockPrisma.customerList.findUnique.mockResolvedValueOnce({
        id: customerListId,
        name: 'Test List',
      })

      // Mock customers exist
      mockPrisma.customer.findMany.mockResolvedValueOnce([
        { id: 'customer-1', name: 'John Doe' },
        { id: 'customer-2', name: 'Jane Smith' },
      ])

      // Mock no existing members
      mockPrisma.customerListMember.findMany.mockResolvedValueOnce([])

      // Mock successful creation
      mockPrisma.customerListMember.createMany.mockResolvedValueOnce({
        count: 2,
      })

      // Mock updated list response
      mockPrisma.customerList.findUnique.mockResolvedValueOnce({
        id: customerListId,
        name: 'Test List',
        members: [
          {
            customer: { id: 'customer-1', name: 'John Doe', phoneNumber: '+1234567890' },
          },
          {
            customer: { id: 'customer-2', name: 'Jane Smith', phoneNumber: '+1987654321' },
          },
        ],
        _count: { members: 2 },
      })

      const request = new NextRequest('http://localhost:3000/api/customer-lists/list-123/members', {
        method: 'POST',
        body: JSON.stringify({
          customerIds,
          addedBy: 'admin-123',
          notes: 'Added via bulk import',
        }),
      })

      const params = Promise.resolve({ id: customerListId })
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Added 2 new members to the list')
      expect(data.data.members).toHaveLength(2)
    })

    it('should return 400 if customerIds is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/customer-lists/list-123/members', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const params = Promise.resolve({ id: 'list-123' })
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Customer IDs array is required')
    })

    it('should return 404 if customer list does not exist', async () => {
      mockPrisma.customerList.findUnique.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/customer-lists/list-123/members', {
        method: 'POST',
        body: JSON.stringify({
          customerIds: ['customer-1'],
        }),
      })

      const params = Promise.resolve({ id: 'list-123' })
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Customer list not found')
    })

    it('should return 404 if some customers do not exist', async () => {
      const customerListId = 'list-123'

      mockPrisma.customerList.findUnique.mockResolvedValueOnce({
        id: customerListId,
        name: 'Test List',
      })

      // Only one customer exists, but two were requested
      mockPrisma.customer.findMany.mockResolvedValueOnce([
        { id: 'customer-1', name: 'John Doe' },
      ])

      const request = new NextRequest('http://localhost:3000/api/customer-lists/list-123/members', {
        method: 'POST',
        body: JSON.stringify({
          customerIds: ['customer-1', 'customer-2'],
        }),
      })

      const params = Promise.resolve({ id: customerListId })
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('One or more customers not found')
    })

    it('should return 409 if all customers are already members', async () => {
      const customerListId = 'list-123'
      const customerIds = ['customer-1', 'customer-2']

      mockPrisma.customerList.findUnique.mockResolvedValueOnce({
        id: customerListId,
        name: 'Test List',
      })

      mockPrisma.customer.findMany.mockResolvedValueOnce([
        { id: 'customer-1', name: 'John Doe' },
        { id: 'customer-2', name: 'Jane Smith' },
      ])

      // All customers are already members
      mockPrisma.customerListMember.findMany.mockResolvedValueOnce([
        { customerId: 'customer-1' },
        { customerId: 'customer-2' },
      ])

      const request = new NextRequest('http://localhost:3000/api/customer-lists/list-123/members', {
        method: 'POST',
        body: JSON.stringify({
          customerIds,
        }),
      })

      const params = Promise.resolve({ id: customerListId })
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('All customers are already members of this list')
    })
  })

  describe('DELETE /api/customer-lists/[id]/members', () => {
    it('should remove members from a customer list successfully', async () => {
      const customerListId = 'list-123'
      const customerIds = ['customer-1', 'customer-2']

      mockPrisma.customerListMember.deleteMany.mockResolvedValueOnce({
        count: 2,
      })

      const url = `http://localhost:3000/api/customer-lists/${customerListId}/members?customerIds=${customerIds.join(',')}`
      const request = new NextRequest(url, {
        method: 'DELETE',
      })

      const params = Promise.resolve({ id: customerListId })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Removed 2 members from the list')
    })

    it('should return 400 if customerIds query parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/customer-lists/list-123/members', {
        method: 'DELETE',
      })

      const params = Promise.resolve({ id: 'list-123' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Customer IDs are required')
    })
  })
})