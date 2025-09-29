import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from './route'

// Mock Prisma
const mockPrisma = {
  customerList: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

describe('/api/customer-lists/[id] API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/customer-lists/[id]', () => {
    it('should retrieve a customer list with members successfully', async () => {
      const customerListId = 'list-123'
      const mockCustomerList = {
        id: customerListId,
        name: 'VIP Customers',
        description: 'High-value customers',
        color: '#ff6b6b',
        isActive: true,
        members: [
          {
            customer: {
              id: 'customer-1',
              name: 'John Doe',
              phoneNumber: '+1234567890',
              email: 'john@example.com',
              category: 'VIP',
              tags: ['frequent'],
              totalOrders: 15,
              totalSpent: 75000,
              lastOrderAt: '2024-01-15T10:00:00Z',
              createdAt: '2024-01-01T10:00:00Z',
            },
          },
        ],
        businessCustomer: {
          id: 'business-1',
          businessName: 'Test Restaurant',
        },
      }

      mockPrisma.customerList.findUnique.mockResolvedValueOnce(mockCustomerList)

      const request = new NextRequest(`http://localhost:3000/api/customer-lists/${customerListId}`)
      const params = Promise.resolve({ id: customerListId })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCustomerList)
      expect(mockPrisma.customerList.findUnique).toHaveBeenCalledWith({
        where: { id: customerListId },
        include: {
          members: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  phoneNumber: true,
                  email: true,
                  category: true,
                  tags: true,
                  totalOrders: true,
                  totalSpent: true,
                  lastOrderAt: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { addedAt: 'desc' },
          },
          businessCustomer: {
            select: {
              id: true,
              businessName: true,
            },
          },
        },
      })
    })

    it('should return 404 if customer list does not exist', async () => {
      mockPrisma.customerList.findUnique.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/customer-lists/nonexistent')
      const params = Promise.resolve({ id: 'nonexistent' })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Customer list not found')
    })
  })

  describe('PUT /api/customer-lists/[id]', () => {
    it('should update a customer list successfully', async () => {
      const customerListId = 'list-123'
      const updateData = {
        name: 'Updated VIP Customers',
        description: 'Updated description',
        color: '#22c55e',
        isActive: false,
      }

      const updatedCustomerList = {
        id: customerListId,
        ...updateData,
        _count: { members: 5 },
      }

      mockPrisma.customerList.update.mockResolvedValueOnce(updatedCustomerList)

      const request = new NextRequest(`http://localhost:3000/api/customer-lists/${customerListId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      const params = Promise.resolve({ id: customerListId })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(updatedCustomerList)
      expect(mockPrisma.customerList.update).toHaveBeenCalledWith({
        where: { id: customerListId },
        data: updateData,
        include: {
          _count: {
            select: { members: true },
          },
        },
      })
    })

    it('should update only provided fields', async () => {
      const customerListId = 'list-123'
      const partialUpdateData = {
        name: 'New Name Only',
      }

      const updatedCustomerList = {
        id: customerListId,
        name: 'New Name Only',
        _count: { members: 3 },
      }

      mockPrisma.customerList.update.mockResolvedValueOnce(updatedCustomerList)

      const request = new NextRequest(`http://localhost:3000/api/customer-lists/${customerListId}`, {
        method: 'PUT',
        body: JSON.stringify(partialUpdateData),
      })

      const params = Promise.resolve({ id: customerListId })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.customerList.update).toHaveBeenCalledWith({
        where: { id: customerListId },
        data: { name: 'New Name Only' },
        include: {
          _count: {
            select: { members: true },
          },
        },
      })
    })
  })

  describe('DELETE /api/customer-lists/[id]', () => {
    it('should delete a customer list successfully', async () => {
      const customerListId = 'list-123'
      const mockCustomerList = {
        id: customerListId,
        name: 'Test List',
        _count: { members: 3 },
      }

      mockPrisma.customerList.findUnique.mockResolvedValueOnce(mockCustomerList)
      mockPrisma.customerList.delete.mockResolvedValueOnce(mockCustomerList)

      const request = new NextRequest(`http://localhost:3000/api/customer-lists/${customerListId}`, {
        method: 'DELETE',
      })

      const params = Promise.resolve({ id: customerListId })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Customer list deleted with 3 members')
      expect(mockPrisma.customerList.delete).toHaveBeenCalledWith({
        where: { id: customerListId },
      })
    })

    it('should return 404 if customer list does not exist', async () => {
      mockPrisma.customerList.findUnique.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/customer-lists/nonexistent', {
        method: 'DELETE',
      })

      const params = Promise.resolve({ id: 'nonexistent' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Customer list not found')
    })
  })
})