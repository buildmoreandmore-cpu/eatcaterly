import { currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'eatcaterly@gmail.com'

export default async function DebugEmailPage() {
  const user = await currentUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h1>
          <p className="text-gray-600">You need to be logged in to see this debug page.</p>
          <a href="/sign-in" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Sign In
          </a>
        </div>
      </div>
    )
  }

  const userEmail = user.emailAddresses.find(
    email => email.id === user.primaryEmailAddressId
  )?.emailAddress

  const normalizedUserEmail = userEmail?.toLowerCase().trim()
  const normalizedAdminEmail = ADMIN_EMAIL.toLowerCase().trim()
  const isMatch = normalizedUserEmail === normalizedAdminEmail

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug: Email Comparison</h1>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">User Information</h2>
            <p className="text-lg"><strong>User ID:</strong> {user.id}</p>
            <p className="text-lg"><strong>Primary Email ID:</strong> {user.primaryEmailAddressId}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">All Email Addresses</h2>
            {user.emailAddresses.map((email, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm text-gray-600">Email {i + 1}:</p>
                <p className="text-lg font-mono">{email.emailAddress}</p>
                <p className="text-xs text-gray-500">ID: {email.id} {email.id === user.primaryEmailAddressId ? '(PRIMARY)' : ''}</p>
              </div>
            ))}
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Primary Email (Raw)</h2>
            <p className="text-lg font-mono bg-gray-100 p-3 rounded break-all">{userEmail || 'NONE'}</p>
            <p className="text-xs text-gray-500 mt-1">Length: {userEmail?.length || 0} characters</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Normalized User Email</h2>
            <p className="text-lg font-mono bg-gray-100 p-3 rounded break-all">{normalizedUserEmail || 'NONE'}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Expected Admin Email</h2>
            <p className="text-lg font-mono bg-gray-100 p-3 rounded break-all">{ADMIN_EMAIL}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Normalized Admin Email</h2>
            <p className="text-lg font-mono bg-gray-100 p-3 rounded break-all">{normalizedAdminEmail}</p>
          </div>

          <div className={`p-4 rounded-lg ${isMatch ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
            <h2 className="text-lg font-bold mb-2">{isMatch ? '✓ MATCH!' : '✗ NO MATCH'}</h2>
            <p className="text-sm">
              {isMatch
                ? 'The emails match. You should be recognized as admin.'
                : 'The emails do NOT match. This is why you\'re not being recognized as admin.'}
            </p>
            {!isMatch && (
              <div className="mt-4 text-sm">
                <p className="font-semibold">Character-by-character comparison:</p>
                <p className="font-mono text-xs mt-2">User:  {normalizedUserEmail?.split('').map((c, i) => `[${c}]`).join('')}</p>
                <p className="font-mono text-xs">Admin: {normalizedAdminEmail?.split('').map((c, i) => `[${c}]`).join('')}</p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <a href="/admin" className="text-blue-600 hover:underline">
              Go to Admin Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
