'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw } from 'lucide-react'

interface SMSLog {
  id: string
  createdAt: string
  direction: string
  status: string
  errorCode: string | null
  message: string
  customer: {
    name: string
    phoneNumber: string
    business: {
      name: string
      assignedPhoneNumber: string
      ezTextingNumberId: string | null
    } | null
  } | null
}

interface Business {
  id: string
  name: string
  phone: string | null
  phoneId: string | null
  ready: boolean
}

export default function DebugSMSPage() {
  const [logs, setLogs] = useState<SMSLog[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch SMS logs
      const logsRes = await fetch('/api/admin/sms-logs')
      if (!logsRes.ok) {
        throw new Error(`Failed to fetch logs: ${logsRes.status}`)
      }
      const logsData = await logsRes.json()
      setLogs(logsData.logs || [])

      // Fetch business info
      const bizRes = await fetch('/api/test-sms')
      if (bizRes.ok) {
        const bizData = await bizRes.json()
        setBusinesses(bizData.businesses || [])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMS Debug Dashboard</h1>
          <p className="text-muted-foreground">
            View SMS logs and PhoneID configuration
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Business PhoneID Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Business PhoneID Configuration</CardTitle>
          <CardDescription>
            Each business must have a PhoneID to send SMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No businesses found</p>
            ) : (
              businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{biz.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Phone: {biz.phone || 'Not assigned'}
                    </div>
                    <div className="text-sm">
                      PhoneID: {biz.phoneId || (
                        <span className="text-destructive">Not configured</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={biz.ready ? 'default' : 'destructive'}>
                    {biz.ready ? 'Ready' : 'Not Ready'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent SMS Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent SMS Logs (Last 50)</CardTitle>
          <CardDescription>
            Shows recent SMS attempts with errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No SMS logs found</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === 'SENT' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {log.direction}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {log.customer && (
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Customer:</span> {log.customer.name} ({log.customer.phoneNumber})
                      </div>
                      {log.customer.business && (
                        <div>
                          <span className="font-medium">Business:</span> {log.customer.business.name}
                          <br />
                          <span className="font-medium">From Phone:</span> {log.customer.business.assignedPhoneNumber}
                          <br />
                          <span className="font-medium">PhoneID:</span> {log.customer.business.ezTextingNumberId || (
                            <span className="text-destructive">Not configured</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {log.errorCode && (
                    <div className="text-sm text-destructive font-mono bg-destructive/10 p-2 rounded">
                      Error: {log.errorCode}
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
