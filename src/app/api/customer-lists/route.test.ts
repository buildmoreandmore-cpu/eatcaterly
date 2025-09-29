import { NextRequest } from 'next/server'
import { GET, POST } from './route'

// Mock Prisma
const mockPrisma = {
  customerList: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

describe('/api/customer-lists API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/customer-lists', () => {
    it('should retrieve all customer lists successfully', async () => {
      const mockCustomerLists = [
        {
          id: 'list-1',
          name: 'VIP Customers',
          description: 'High-value customers',
          color: '#ff6b6b',
          isActive: true,
          businessCustomerId: 'business-1',
          _count: { members: 15 },
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'list-2',
          name: 'Regular Customers',
          description: 'Regular ordering customers',
          color: '#4ecdc4',
          isActive: true,
          businessCustomerId: 'business-1',
          _count: { members: 32 },
          createdAt: '2024-01-05T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
      ]

      mockPrisma.customerList.findMany.mockResolvedValueOnce(mockCustomerLists)

      const request = new NextRequest('http://localhost:3000/api/customer-lists')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCustomerLists)
      expect(mockPrisma.customerList.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return empty array if no customer lists exist', async () => {
      mockPrisma.customerList.findMany.mockResolvedValueOnce([])

      const request = new NextRequest('http://localhost:3000/api/customer-lists')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })
  })

  describe('POST /api/customer-lists', () => {
    it('should create a new customer list successfully', async () => {
      const newListData = {
        name: 'Weekend Regulars',
        description: 'Customers who order on weekends',
        color: '#f39c12',
        businessCustomerId: 'business-1',
      }

      const createdList = {
        id: 'list-123',
        ...newListData,
        isActive: true,
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-01-25T10:00:00Z',
        _count: { members: 0 },
      }

      mockPrisma.customerList.create.mockResolvedValueOnce(createdList)

      const request = new NextRequest('http://localhost:3000/api/customer-lists', {
        method: 'POST',
        body: JSON.stringify(newListData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdList)
      expect(mockPrisma.customerList.create).toHaveBeenCalledWith({
        data: newListData,
        include: {
          _count: {
            select: { members: true },
          },
        },
      })
    })

    it('should return 400 if name is missing', async () => {
      const invalidData = {
        description: 'Missing name field',
        businessCustomerId: 'business-1',
      }

      const request = new NextRequest('http://localhost:3000/api/customer-lists', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name and businessCustomerId are required')
    })

    it('should return 400 if businessCustomerId is missing', async () => {
      const invalidData = {
        name: 'Test List',
        description: 'Missing business customer ID',
      }

      const request = new NextRequest('http://localhost:3000/api/customer-lists', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name and businessCustomerId are required')
    })

    it('should create a customer list with minimal data', async () => {
      const minimalData = {
        name: 'Simple List',
        businessCustomerId: 'business-1',
      }

      const createdList = {
        id: 'list-456',
        ...minimalData,
        description: null,
        color: null,
        isActive: true,
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-01-25T10:00:00Z',
        _count: { members: 0 },
      }

      mockPrisma.customerList.create.mockResolvedValueOnce(createdList)

      const request = new NextRequest('http://localhost:3000/api/customer-lists', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdList)
      expect(mockPrisma.customerList.create).toHaveBeenCalledWith({
        data: minimalData,
        include: {
          _count: {
            select: { members: true },
          },
        },
      })
    })
  })
})