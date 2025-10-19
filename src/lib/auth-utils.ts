import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAIL = 'eatcaterly@gmail.com'

/**
 * Check if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    if (!user) return false

    const userEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress

    return userEmail === ADMIN_EMAIL
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get the current user's email
 * @returns user email or null
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const user = await currentUser()
    if (!user) return null

    return user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress || null
  } catch (error) {
    console.error('Error getting user email:', error)
    return null
  }
}

/**
 * Check if user has admin privileges (for use in components)
 * Can be expanded to include other admin emails or role-based system
 */
export function checkIsAdminEmail(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}
