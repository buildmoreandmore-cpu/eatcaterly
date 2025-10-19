import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'eatcaterly@gmail.com'
const ADMIN_USER_ID = 'user_34AyHh3kVYM0kr5LBYkf1phUrLu' // eatcaterly@gmail.com user ID

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
// Allow onboarding without auth for testing
const isTestingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Allow onboarding routes without auth for testing Stripe checkout
  if (isTestingRoute(req)) {
    return
  }

  // Special handling for admin routes - require specific email
  if (isAdminRoute(req)) {
    const { userId } = await auth()

    // Require authentication
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check if this is the admin user ID (faster than fetching user)
    if (userId !== ADMIN_USER_ID) {
      // Not the admin user - show 403 error
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized. Admin access only.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
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