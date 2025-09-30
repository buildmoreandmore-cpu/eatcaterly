import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Check if this is a protected route
  if (isProtectedRoute(req)) {
    // Check for demo mode first (allow bypass)
    const isDemoMode = req.nextUrl.searchParams.get('demo') === 'true'

    if (!isDemoMode) {
      // For live users, protect the route with Clerk
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