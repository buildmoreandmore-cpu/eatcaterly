'use client'

import { useState } from 'react'

export default function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonials = [
    {
      quote: "EatCaterly transformed how I connect with customers. I can share my daily specials instantly and orders come in automatically. My revenue increased 40% in just two months!",
      author: "Maria Rodriguez",
      title: "Chef & Owner, Maria's Kitchen",
      avatar: "👩‍🍳"
    },
    {
      quote: "The SMS ordering system is genius. Our customers love how easy it is to order without downloading apps. We've tripled our catering bookings since switching to EatCaterly.",
      author: "James Chen",
      title: "Owner, Spice Route Catering",
      avatar: "👨‍💼"
    },
    {
      quote: "Managing our food truck orders has never been easier. Real-time updates, instant payments, and happy customers. EatCaterly is a game-changer for mobile food businesses.",
      author: "Sarah Johnson",
      title: "Food Truck Owner, Garden Fresh",
      avatar: "👩‍🌾"
    }
  ]

  return (
    <section id="testimonials" role="region" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by food professionals everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of chefs, caterers, and food business owners who are growing their revenue with EatCaterly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Stars */}
          <div className="flex justify-center mb-8">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-2xl">★</span>
            ))}
          </div>

          {/* Testimonial content */}
          <div className="text-center mb-8">
            <blockquote className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
              "{testimonials[activeTestimonial].quote}"
            </blockquote>

            <div className="flex items-center justify-center space-x-4">
              <div className="text-4xl">{testimonials[activeTestimonial].avatar}</div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].author}</div>
                <div className="text-gray-600">{testimonials[activeTestimonial].title}</div>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeTestimonial ? 'bg-orange-500' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}