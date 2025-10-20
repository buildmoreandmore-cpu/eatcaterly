import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAIL = 'eatcaterly@gmail.com'

/**
 * Check if the current user is an admin (SERVER-ONLY)
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    console.log('[isAdmin] User exists:', !!user)
    if (!user) return false

    const userEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress

    if (!userEmail) {
      console.log('[isAdmin] No email found for user')
      return false
    }

    // Case-insensitive comparison with trimming
    const normalizedUserEmail = userEmail.toLowerCase().trim()
    const normalizedAdminEmail = ADMIN_EMAIL.toLowerCase().trim()

    console.log('[isAdmin] User email:', userEmail)
    console.log('[isAdmin] Normalized user email:', normalizedUserEmail)
    console.log('[isAdmin] Admin email:', ADMIN_EMAIL)
    console.log('[isAdmin] Normalized admin email:', normalizedAdminEmail)
    console.log('[isAdmin] Emails match:', normalizedUserEmail === normalizedAdminEmail)

    return normalizedUserEmail === normalizedAdminEmail
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get the current user's email (SERVER-ONLY)
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
