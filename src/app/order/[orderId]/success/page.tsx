import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

interface OrderSuccessPageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      businessCustomer: true,
    },
  })

  if (!order) {
    notFound()
  }

  const items = order.items as Array<{
    name: string
    price: number
    quantity: number
    description?: string
  }>

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Thank you for your order. You'll receive updates via SMS.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Details
          </h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-gray-900">{order.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">{order.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Restaurant:</span>
              <span className="text-gray-900">{order.businessCustomer?.businessName}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-900">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">
                ${(order.totalAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center text-sm text-gray-600">
          <p>Questions about your order?</p>
          <p className="mt-1">
            Contact {order.businessCustomer?.businessName} at{' '}
            <span className="font-semibold">
              {order.businessCustomer?.assignedPhoneNumber}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
