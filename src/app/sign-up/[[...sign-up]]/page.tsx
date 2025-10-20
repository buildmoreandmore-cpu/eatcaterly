import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp
        fallbackRedirectUrl="/auth/callback"
        forceRedirectUrl="/auth/callback"
      />
    </div>
  )
}
