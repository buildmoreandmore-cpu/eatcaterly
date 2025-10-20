import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'eatcaterly@gmail.com'

export default async function AuthCallbackPage() {
  try {
    // Get the current authenticated user
    const user = await currentUser()

    if (!user) {
      // Not authenticated, redirect to sign-in
      redirect('/sign-in')
    }

    // Get user's email
    const userEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress

    if (!userEmail) {
      // No email found, something went wrong
      redirect('/sign-in')
    }

    // Check if this is the platform admin
    if (userEmail === ADMIN_EMAIL) {
      // Platform admin always goes to admin dashboard
      redirect('/admin')
    }

    // Check if this user has a business account in the database
    const businessAccount = await prisma.businessCustomer.findUnique({
      where: { contactEmail: userEmail },
      select: {
        id: true,
        onboardingCompleted: true,
        subscriptionStatus: true
      }
    })

    if (!businessAccount) {
      // No business account exists - this is a new user, send to onboarding
      redirect('/onboarding')
    }

    if (!businessAccount.onboardingCompleted) {
      // Business account exists but onboarding not completed - resume onboarding
      redirect('/onboarding')
    }

    // Onboarding completed, send to dashboard
    redirect('/admin')

  } catch (error) {
    console.error('Error in auth callback:', error)
    // On error, send to onboarding to be safe
    redirect('/onboarding')
  }
}
