import Link from 'next/link'
import LoginForm from '../../components/auth/LoginForm'

export const metadata = {
  title: 'Login - EatCaterly',
  description: 'Sign in to your EatCaterly account'
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">EC</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">EatCaterly</span>
        </Link>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your EatCaterly account</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-orange-600 hover:text-orange-500 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}