import Header from '../../components/landing/Header'
import Footer from '../../components/landing/Footer'

export const metadata = {
  title: 'About - EatCaterly | Simplifying Food Business Communications',
  description: 'Learn about EatCaterly\'s mission to help food businesses connect with customers through simple SMS solutions.'
}

export default function AboutPage() {
  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            About EatCaterly
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're on a mission to help food businesses thrive by making customer communication simple, effective, and profitable.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Food businesses shouldn't have to struggle with complex technology to reach their customers.
                EatCaterly bridges the gap between passionate food entrepreneurs and their hungry customers
                through the simplicity of text messaging.
              </p>
              <p className="text-lg text-gray-600">
                We believe every chef, caterer, and food truck owner deserves tools that are as reliable
                and straightforward as their commitment to great food.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Built for Food Professionals</h3>
                <p className="text-gray-700">
                  Every feature is designed with the unique needs of food businesses in mind,
                  from daily specials to large catering events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-xl text-gray-600">
              EatCaterly was born from a simple observation: food businesses were struggling to efficiently
              communicate with their customers while staying compliant with ever-changing SMS regulations.
            </p>
          </div>

          <div className="space-y-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">The Problem We Saw</h3>
              <p className="text-gray-600 leading-relaxed">
                Restaurants, caterers, and food trucks were using outdated methods to reach customers -
                from social media posts that got lost in feeds to email newsletters that ended up in spam folders.
                Meanwhile, SMS had the highest open rates but came with complex compliance requirements.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Solution</h3>
              <p className="text-gray-600 leading-relaxed">
                We created EatCaterly to remove all barriers between food businesses and their customers.
                By providing pre-registered, compliant phone numbers and intuitive tools, we let food
                professionals focus on what they do best - creating amazing food experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do at EatCaterly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Simplicity First</h3>
              <p className="text-gray-600">
                We believe powerful tools should be easy to use. No complex setup, no confusing interfaces.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Compliance Guaranteed</h3>
              <p className="text-gray-600">
                We handle all the technical and legal complexities so you can message with confidence.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Success</h3>
              <p className="text-gray-600">
                Your success is our success. We're here to help your food business grow and thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Built by Food Industry Veterans</h2>
          <p className="text-xl text-gray-600 mb-12">
            Our team combines deep technology expertise with real-world food business experience.
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍💼</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Leadership Team</h3>
              <p className="text-gray-600">
                Former restaurant operators, SMS industry experts, and technology leaders who understand
                both the challenges and opportunities in food service communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of food businesses who trust EatCaterly for their customer communications.
          </p>
          <a
            href="/login"
            className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Get Started Today
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}