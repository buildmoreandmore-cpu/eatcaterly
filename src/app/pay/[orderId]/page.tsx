'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, CreditCard, Phone, Loader2 } from 'lucide-react'

interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  totalAmount: number
  status: string
  items: OrderItem[]
  customer: {
    name?: string
    phoneNumber: string
  }
  menu: {
    title?: string
    date: string
  }
  createdAt: string
}

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
      } else {
        setError(data.error || 'Order not found')
      }
    } catch (err) {
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setPaying(true)
    try {
      // In a real implementation, this would integrate with Stripe or another payment processor
      const response = await fetch(`/api/orders/${params.orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'card' })
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to Stripe or update order status
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          // For demo purposes, just update the order status
          setOrder(prev => prev ? { ...prev, status: 'PAID' } : null)
        }
      } else {
        setError(data.error || 'Payment failed')
      }
    } catch (err) {
      setError('Payment processing failed')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Order Not Found</CardTitle>
            <CardDescription>
              {error || 'The order you\'re looking for could not be found.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString()
  const total = (order.totalAmount / 100).toFixed(2)

  if (order.status === 'PAID' || order.status === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your order has been confirmed and payment received.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Order #{order.id.slice(-6)}</h3>
              <p className="text-green-800 text-sm">
                We'll send you an SMS when your order is ready for pickup or delivery.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Order Summary</h4>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price / 100).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            SMS Food Delivery
          </CardTitle>
          <CardDescription>
            Complete your order payment
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Order #{order.id.slice(-6)}</span>
            </div>
            <p className="text-sm text-blue-800">
              {order.menu.title || 'Menu'} • {orderDate}
            </p>
            <p className="text-sm text-blue-800">
              {order.customer.name || 'Customer'} • {order.customer.phoneNumber}
            </p>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold">Your Order</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">${(item.price / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={paying}
            className="w-full"
            size="lg"
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ${total}
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your payment is processed securely. You'll receive an SMS confirmation once payment is complete.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}