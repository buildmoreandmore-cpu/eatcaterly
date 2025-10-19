import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'eatcaterly@gmail.com'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
// Allow onboarding without auth for testing
const isTestingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Allow onboarding routes without auth for testing Stripe checkout
  if (isTestingRoute(req)) {
    return
  }

  // Admin routes require authentication (role-based access handled in components)
  if (isAdminRoute(req)) {
    const { userId } = await auth()

    // Require authentication for all admin routes
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Allow all authenticated users to access admin dashboard
    // Individual pages will check user role and hide admin-only features
  }

  // Check if this is a regular protected route (dashboard)
  if (isProtectedRoute(req)) {
    const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_dummy_clerk_publishable'

    if (hasClerkKeys) {
      await auth.protect()
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}