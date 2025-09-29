'use client'

import { useState } from 'react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(5) // "What kind of support do you provide?" is open by default

  const faqs = [
    {
      question: "How quickly can I get started?",
      answer: "You can get started in just a few minutes! Simply sign up, add your menu items, and start sending them to customers. No complex setup or lengthy onboarding process required."
    },
    {
      question: "Do my customers need to download an app?",
      answer: "No! That's the beauty of EatCaterly. Your customers can view menus, place orders, and make payments all through text messages. No app downloads required."
    },
    {
      question: "What payment methods do you support?",
      answer: "We support all major credit cards, debit cards, and digital wallets. Payments are processed securely through our integrated payment system with instant confirmation."
    },
    {
      question: "Can I customize my menus for different events?",
      answer: "Absolutely! You can create multiple menus for different occasions - daily specials, catering events, seasonal items, and more. Each menu can be customized with specific pricing and availability."
    },
    {
      question: "Is there a limit on the number of customers I can reach?",
      answer: "Our Starter plan supports up to 100 customers, while our Pro plan offers unlimited customers. You can upgrade anytime as your business grows."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer email support for all users, with priority support for Pro plan customers. Our team is here to help you succeed with setup, troubleshooting, and growing your business."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section role="region" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}