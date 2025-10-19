const ADMIN_EMAIL = 'eatcaterly@gmail.com'

/**
 * Check if user has admin privileges (for use in client components)
 * Can be expanded to include other admin emails or role-based system
 */
export function checkIsAdminEmail(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}

/**
 * Get the admin email constant
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL
}
