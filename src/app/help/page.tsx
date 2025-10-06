import Header from '../../components/landing/Header'
import Footer from '../../components/landing/Footer'

export const metadata = {
  title: 'Help Center - EatCaterly | Support & Resources',
  description: 'Find answers to common questions about EatCaterly\'s SMS solutions for food businesses. Get help with setup, features, and troubleshooting.'
}

export default function HelpPage() {
  const helpCategories = [
    {
      icon: '🚀',
      title: 'Getting Started',
      description: 'Everything you need to know to set up your account and send your first messages.',
      articles: [
        'Creating your EatCaterly account',
        'Setting up your business profile',
        'Importing your customer list',
        'Sending your first menu',
        'Understanding SMS compliance'
      ]
    },
    {
      icon: '📱',
      title: 'SMS Features',
      description: 'Learn how to use all of EatCaterly\'s messaging and communication features.',
      articles: [
        'Creating and managing menus',
        'Scheduling daily specials',
        'Processing orders via SMS',
        'Setting up automated responses',
        'Managing customer preferences'
      ]
    },
    {
      icon: '💳',
      title: 'Billing & Pricing',
      description: 'Understanding your subscription, billing, and pricing options.',
      articles: [
        'Understanding pricing plans',
        'Managing your subscription',
        'Payment methods and billing',
        'Upgrading or downgrading plans',
        'Refund and cancellation policy'
      ]
    },
    {
      icon: '🛡️',
      title: 'Compliance & Security',
      description: 'Learn about A2P compliance, data security, and best practices.',
      articles: [
        'A2P compliance explained',
        'TCPA compliance guidelines',
        'Opt-in and opt-out requirements',
        'Data security and privacy',
        'Message content best practices'
      ]
    },
    {
      icon: '📊',
      title: 'Analytics & Reporting',
      description: 'Track performance and understand your messaging analytics.',
      articles: [
        'Understanding delivery reports',
        'Tracking customer engagement',
        'Revenue analytics',
        'Export data and reports',
        'Setting up notifications'
      ]
    },
    {
      icon: '🔧',
      title: 'Troubleshooting',
      description: 'Common issues and how to resolve them quickly.',
      articles: [
        'Messages not being delivered',
        'Customer opt-out issues',
        'Payment processing problems',
        'Account access issues',
        'Technical error codes'
      ]
    }
  ]

  const quickHelp = [
    {
      question: 'How do I send my first menu?',
      answer: 'Go to Menu Management, create a new menu with your items and prices, then use the Send Menu feature to text it to your customers.'
    },
    {
      question: 'Why aren\'t my messages being delivered?',
      answer: 'Check that you\'re using compliant content, customers haven\'t opted out, and your account is in good standing. Contact support if issues persist.'
    },
    {
      question: 'How do I add new customers?',
      answer: 'Navigate to Customers, click "Add Customer," and enter their information. They\'ll automatically receive an opt-in confirmation.'
    },
    {
      question: 'Can I schedule messages in advance?',
      answer: 'Yes! Use the Schedule feature when creating your message to send menus at optimal times for your business.'
    }
  ]

  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Find answers to your questions and learn how to get the most out of EatCaterly.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-12"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Answers</h2>
            <p className="text-lg text-gray-600">Common questions and instant solutions</p>
          </div>

          <div className="space-y-4">
            {quickHelp.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">
              Find detailed guides and tutorials organized by topic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>

                <ul className="space-y-3">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <a href="#" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View all articles →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Video Tutorials</h2>
            <p className="text-xl text-gray-600">
              Watch step-by-step guides to master EatCaterly features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Getting Started with EatCaterly',
                duration: '5:30',
                description: 'Complete setup walkthrough from account creation to sending your first menu.'
              },
              {
                title: 'Creating Effective Menu Messages',
                duration: '3:45',
                description: 'Best practices for formatting menus that drive orders and engagement.'
              },
              {
                title: 'Managing Customer Lists',
                duration: '4:15',
                description: 'How to import, organize, and segment your customer database.'
              },
              {
                title: 'Understanding Analytics',
                duration: '6:20',
                description: 'Track performance and optimize your messaging strategy with data.'
              },
              {
                title: 'SMS Compliance Basics',
                duration: '7:10',
                description: 'Everything you need to know about staying compliant with SMS regulations.'
              },
              {
                title: 'Troubleshooting Common Issues',
                duration: '4:55',
                description: 'Quick solutions to the most common problems users encounter.'
              }
            ].map((video, index) => (
              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">{video.duration}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Still Need Help?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:eatcaterly@gmail.com"
              className="border border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}