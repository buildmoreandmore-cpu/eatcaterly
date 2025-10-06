'use client'

import { useState } from 'react'

export default function A2PFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0) // First question open by default

  const faqs = [
    {
      question: "What is A2P compliance and why does it matter?",
      answer: "A2P (Application-to-Person) compliance ensures commercial SMS messages meet carrier requirements for delivery and legal standards. EatCaterly provides pre-registered, compliant phone numbers so your messages have maximum delivery rates and you stay compliant automatically."
    },
    {
      question: "Do I need to register for A2P myself?",
      answer: "No! EatCaterly provides you with phone numbers that are already A2P-compliant and registered with all major carriers. You can start sending messages immediately without any registration process, paperwork, or waiting periods."
    },
    {
      question: "What happens if I don't register for A2P?",
      answer: "Without A2P registration, your messages may be filtered, blocked, or have significantly reduced delivery rates. Carriers are increasingly strict about unregistered commercial messaging, which could result in complete service suspension."
    },
    {
      question: "Does A2P compliance cost extra?",
      answer: "No additional fees! A2P-compliant phone numbers are included in your EatCaterly subscription. You get professional, compliant messaging service at no extra cost, with better delivery rates that improve your ROI."
    },
    {
      question: "What information do I need to provide?",
      answer: "Just your basic business information during signup. No special documents, licenses, or registrations needed. EatCaterly handles all the compliance requirements behind the scenes using our pre-registered phone numbers."
    },
    {
      question: "How quickly can I start sending compliant messages?",
      answer: "Immediately! Since EatCaterly provides pre-registered, A2P-compliant phone numbers, you can start sending messages as soon as you create your account. No waiting periods or approval processes required."
    },
    {
      question: "What types of messages can I send with A2P registration?",
      answer: "With A2P registration, you can send promotional messages, order updates, delivery notifications, special offers, and customer service communications. All messages must comply with TCPA regulations and include proper opt-out instructions."
    },
    {
      question: "Do I need separate registration for each phone number?",
      answer: "No, A2P registration covers your business entity and approved use cases. All phone numbers used for your registered campaigns will benefit from the improved delivery and compliance status."
    },
    {
      question: "How does EatCaterly help with A2P compliance?",
      answer: "EatCaterly handles the entire A2P registration process for you, including documentation preparation, carrier submissions, compliance monitoring, and ongoing support. We ensure your food business stays compliant while you focus on serving customers."
    },
    {
      question: "What if my A2P registration is denied?",
      answer: "Registration denials are rare when properly prepared. If issues arise, EatCaterly's compliance team will work with you to address any concerns, revise documentation, and resubmit. We have a 99%+ success rate for A2P approvals."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" role="region" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            A2P Registration FAQ
          </h2>
          <p className="text-xl text-gray-600">
            Get answers to common questions about A2P registration and SMS compliance for food businesses.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform flex-shrink-0 ${
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

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our A2P compliance experts are here to help. Get personalized guidance for your food business's SMS requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:eatcaterly@gmail.com"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Compliance Team
              </a>
              <a
                href="tel:+1-555-0123"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Call (555) 012-3456
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}