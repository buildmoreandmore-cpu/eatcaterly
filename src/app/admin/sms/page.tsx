'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  Send,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface SmsLog {
  id: string
  customerId?: string
  direction: 'INBOUND' | 'OUTBOUND'
  message: string
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'RECEIVED'
  twilioSid?: string
  errorCode?: string
  createdAt: string
  customer?: {
    id: string
    phoneNumber: string
    name?: string
  }
}

const statusColors = {
  SENT: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  RECEIVED: 'bg-purple-100 text-purple-800'
}

const statusIcons = {
  SENT: CheckCircle,
  DELIVERED: CheckCircle,
  FAILED: XCircle,
  RECEIVED: ArrowDown
}

export default function SmsLogsPage() {
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'INBOUND' | 'OUTBOUND'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RECEIVED'>('ALL')

  useEffect(() => {
    fetchSmsLogs()
  }, [])

  const fetchSmsLogs = async () => {
    try {
      const response = await fetch('/api/sms/logs')
      if (response.ok) {
        const data = await response.json()
        setSmsLogs(data)
      } else {
        // Demo data if API fails
        setSmsLogs([
          {
            id: 'demo-1',
            customerId: 'cust-1',
            direction: 'OUTBOUND',
            message: '🍽️ Today\'s Menu\n\n1. Grilled Chicken Sandwich - $12.00\n2. Caesar Salad - $9.50\n3. Chocolate Chip Cookies - $4.50\n\nReply with item numbers to order!\nExample: "Item 1 and Item 3"',
            status: 'DELIVERED',
            twilioSid: 'demo_sms_123',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            customer: {
              id: 'cust-1',
              phoneNumber: '+1234567890',
              name: 'John Smith'
            }
          },
          {
            id: 'demo-2',
            customerId: 'cust-1',
            direction: 'INBOUND',
            message: 'Item 1 and Item 2',
            status: 'RECEIVED',
            createdAt: new Date(Date.now() - 3000000).toISOString(),
            customer: {
              id: 'cust-1',
              phoneNumber: '+1234567890',
              name: 'John Smith'
            }
          },
          {
            id: 'demo-3',
            customerId: 'cust-1',
            direction: 'OUTBOUND',
            message: 'Order confirmed! 🛒\n\n• Grilled Chicken Sandwich - $12.00\n• Caesar Salad - $9.50\n\nTotal: $21.50\n\n💳 Pay here: https://demo-payment-link.example.com\n\nOrder #abc123',
            status: 'DELIVERED',
            twilioSid: 'demo_sms_124',
            createdAt: new Date(Date.now() - 2400000).toISOString(),
            customer: {
              id: 'cust-1',
              phoneNumber: '+1234567890',
              name: 'John Smith'
            }
          },
          {
            id: 'demo-4',
            customerId: 'cust-2',
            direction: 'OUTBOUND',
            message: 'Welcome to SMS Food Delivery! 🍽️\n\nReply with your name to get started, or wait for our daily menu updates.\n\nReply STOP to unsubscribe.',
            status: 'SENT',
            twilioSid: 'demo_sms_125',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            customer: {
              id: 'cust-2',
              phoneNumber: '+1234567891',
              name: undefined
            }
          },
          {
            id: 'demo-5',
            customerId: 'cust-2',
            direction: 'INBOUND',
            message: 'Sarah Johnson',
            status: 'RECEIVED',
            createdAt: new Date(Date.now() - 1200000).toISOString(),
            customer: {
              id: 'cust-2',
              phoneNumber: '+1234567891',
              name: 'Sarah Johnson'
            }
          },
          {
            id: 'demo-6',
            customerId: 'cust-3',
            direction: 'OUTBOUND',
            message: '🍽️ Today\'s Menu\n\n1. Grilled Chicken Sandwich - $12.00\n2. Caesar Salad - $9.50\n3. Chocolate Chip Cookies - $4.50\n\nReply with item numbers to order!\nExample: "Item 1 and Item 3"',
            status: 'FAILED',
            errorCode: '21614',
            createdAt: new Date(Date.now() - 600000).toISOString(),
            customer: {
              id: 'cust-3',
              phoneNumber: '+1234567892',
              name: undefined
            }
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch SMS logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = smsLogs.filter(log => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.customer?.phoneNumber.includes(searchTerm) ||
      (log.customer?.name && log.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDirection = directionFilter === 'ALL' || log.direction === directionFilter
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter

    return matchesSearch && matchesDirection && matchesStatus
  })

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDirectionIcon = (direction: string) => {
    return direction === 'INBOUND' ? ArrowDown : ArrowUp
  }

  const getDirectionColor = (direction: string) => {
    return direction === 'INBOUND' ? 'text-green-600' : 'text-blue-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            SMS Logs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View all SMS messages sent and received
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <Button
            onClick={fetchSmsLogs}
            className="inline-flex items-center"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Messages
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {smsLogs.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sent Messages
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {smsLogs.filter(log => log.direction === 'OUTBOUND').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowDown className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Received Messages
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {smsLogs.filter(log => log.direction === 'INBOUND').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Failed Messages
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {smsLogs.filter(log => log.status === 'FAILED').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Messages
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages, phone numbers, names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direction
            </label>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as any)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Directions</option>
              <option value="OUTBOUND">Outbound (Sent)</option>
              <option value="INBOUND">Inbound (Received)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RECEIVED">Received</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setDirectionFilter('ALL')
                setStatusFilter('ALL')
              }}
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* SMS Logs List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Message History ({filteredLogs.length} messages)
          </h3>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No messages found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || directionFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'No SMS messages have been sent or received yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const DirectionIcon = getDirectionIcon(log.direction)
                const StatusIcon = statusIcons[log.status]

                return (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`flex items-center space-x-1 ${getDirectionColor(log.direction)}`}>
                            <DirectionIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {log.direction === 'INBOUND' ? 'Received' : 'Sent'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{log.customer?.phoneNumber}</span>
                            {log.customer?.name && (
                              <>
                                <span>•</span>
                                <User className="h-4 w-4" />
                                <span>{log.customer.name}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimestamp(log.createdAt)}</span>
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                            {log.message}
                          </pre>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {log.status}
                            </span>

                            {log.twilioSid && (
                              <span className="text-xs text-gray-500">
                                ID: {log.twilioSid.slice(-8)}
                              </span>
                            )}
                          </div>

                          {log.errorCode && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">Error: {log.errorCode}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}