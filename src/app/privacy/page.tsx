import Header from '../../components/landing/Header'
import Footer from '../../components/landing/Footer'

export const metadata = {
  title: 'Privacy Policy - EatCaterly | Data Protection & Privacy',
  description: 'Learn how EatCaterly protects your privacy and handles customer data in compliance with SMS regulations and data protection laws.'
}

export default function PrivacyPage() {
  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Your privacy matters to us. Learn how we collect, use, and protect your data.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 1, 2025
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">

            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                EatCaterly ("we," "our," or "us") is committed to protecting your privacy and ensuring
                the security of your personal information. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our SMS messaging platform
                for food businesses.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using EatCaterly's services, you agree to the collection and use of information
                in accordance with this policy.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Business information and payment details</li>
                <li>Customer contact information you provide for messaging</li>
                <li>Account credentials and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                <li>Message content, delivery status, and engagement metrics</li>
                <li>Platform usage patterns and feature interactions</li>
                <li>Device information and IP addresses</li>
                <li>Log files and analytics data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Data</h3>
              <p className="text-gray-600 leading-relaxed">
                We process customer data on behalf of our business users, including customer names,
                phone numbers, and messaging preferences. We act as a data processor for this information.
              </p>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide and maintain our SMS messaging services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important account and service notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure compliance with SMS regulations and carrier requirements</li>
                <li>Provide customer support and resolve issues</li>
                <li>Analyze usage patterns to optimize performance</li>
                <li>Prevent fraud and maintain platform security</li>
              </ul>
            </div>

            {/* SMS Compliance */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">SMS Compliance & Consent</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">A2P Registration</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                EatCaterly maintains A2P (Application-to-Person) registration with major carriers
                to ensure compliant business messaging. We provide registered phone numbers and
                handle compliance requirements on behalf of our users.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Consent</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                All SMS recipients must provide explicit consent before receiving messages. We help
                businesses maintain proper opt-in records and honor opt-out requests immediately.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">TCPA Compliance</h3>
              <p className="text-gray-600 leading-relaxed">
                We comply with the Telephone Consumer Protection Act (TCPA) and similar regulations,
                ensuring all business messaging follows proper consent and content guidelines.
              </p>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Information Sharing</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties.
                We may share information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>With SMS carriers and service providers necessary to deliver messages</li>
                <li>With payment processors to handle billing and subscriptions</li>
                <li>With cloud service providers who help us operate our platform</li>
                <li>When required by law or to protect our rights and users</li>
                <li>In connection with a business merger or acquisition</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect
                your information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and employee training</li>
                <li>Secure cloud infrastructure with industry-standard protections</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide our services
                and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Account information: For the duration of your subscription plus 7 years</li>
                <li>Message data: 90 days for delivery and analytics purposes</li>
                <li>Customer consent records: 5 years to maintain compliance</li>
                <li>Payment information: As required by financial regulations</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access: Request copies of your personal data</li>
                <li>Correction: Request correction of inaccurate information</li>
                <li>Deletion: Request deletion of your personal data</li>
                <li>Portability: Request transfer of your data to another service</li>
                <li>Restriction: Request limitation of data processing</li>
                <li>Objection: Object to certain types of data processing</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@eatcaterly.com.
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies and Tracking</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar technologies to improve your experience and analyze
                platform usage:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Essential cookies for platform functionality</li>
                <li>Analytics cookies to understand usage patterns</li>
                <li>Preference cookies to remember your settings</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can control cookies through your browser settings, though some features
                may not work properly if cookies are disabled.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                EatCaterly is designed for business use and is not intended for children under 18.
                We do not knowingly collect personal information from children. If we become aware
                that we have collected information from a child, we will delete it promptly.
              </p>
            </div>

            {/* International Users */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">International Users</h2>
              <p className="text-gray-600 leading-relaxed">
                EatCaterly is based in the United States. If you are accessing our services from
                outside the U.S., please be aware that your information may be transferred to,
                stored, and processed in the United States where our servers are located.
              </p>
            </div>

            {/* Policy Updates */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Policy Updates</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the "Last updated"
                date. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@eatcaterly.com</p>
                <p className="text-gray-700 mb-2"><strong>Address:</strong> EatCaterly Privacy Team</p>
                <p className="text-gray-700 mb-2">123 Food Innovation Drive</p>
                <p className="text-gray-700">Atlanta, GA 30309, United States</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}