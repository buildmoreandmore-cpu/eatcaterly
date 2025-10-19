import { auth, currentUser } from '@clerk/nextjs/server'

export default async function DebugAuthPage() {
  const { userId, sessionClaims } = await auth()
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Auth Debug Info</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User ID</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {userId || 'Not signed in'}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Email (from sessionClaims)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {(sessionClaims?.email as string) || 'No email in session claims'}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">All Session Claims</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(sessionClaims, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(
              {
                id: user?.id,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.emailAddresses?.[0]?.emailAddress,
                allEmails: user?.emailAddresses,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Admin Access Requirements:</h3>
          <p className="text-blue-800">
            You must be signed in with: <span className="font-mono font-bold">eatcaterly@gmail.com</span>
          </p>
          <p className="text-blue-800 mt-2">
            Current email: <span className="font-mono font-bold">
              {(sessionClaims?.email as string) || user?.emailAddresses?.[0]?.emailAddress || 'Unknown'}
            </span>
          </p>
          <p className="text-sm text-blue-700 mt-4">
            If this is not the correct email, sign out and sign in with eatcaterly@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}
