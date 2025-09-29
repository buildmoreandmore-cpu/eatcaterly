'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-orange-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Catering.
                <br />
                <span className="text-orange-500">Made simple.</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                The platform that lets chefs, caterers, and food businesses share daily menus, send them by text, and accept payments. Transform how you connect with customers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors text-center"
              >
                Get Started Free
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors">
                Watch Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Free 14-day trial
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
            </div>
          </div>

          {/* Right column - Menu preview card */}
          <div className="lg:justify-self-end">
            <div
              data-testid="menu-card"
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-12 max-w-xl mx-auto"
            >
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Today's Menu</h3>
                <span className="text-lg text-gray-500">Chef Maria's Kitchen</span>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-medium text-gray-900">Grilled Salmon</h4>
                    <p className="text-lg text-gray-500">With lemon herbs</p>
                  </div>
                  <span className="text-2xl font-semibold text-orange-500">$24</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-medium text-gray-900">Pasta Primavera</h4>
                    <p className="text-lg text-gray-500">Fresh vegetables</p>
                  </div>
                  <span className="text-2xl font-semibold text-orange-500">$18</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-medium text-gray-900">Caesar Salad</h4>
                    <p className="text-lg text-gray-500">Crispy romaine</p>
                  </div>
                  <span className="text-2xl font-semibold text-orange-500">$12</span>
                </div>
              </div>

              <button className="w-full bg-orange-500 text-white py-5 rounded-lg font-semibold text-xl mt-10 hover:bg-orange-600 transition-colors">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}