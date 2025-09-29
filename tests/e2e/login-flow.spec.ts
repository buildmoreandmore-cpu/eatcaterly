import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('complete login flow to admin dashboard', async ({ page }) => {
    // Start at landing page
    await page.goto('/')

    // Click login button
    await page.getByText('Log in').first().click()
    await expect(page).toHaveURL('/login')

    // Fill login form
    await page.getByLabel('Email').fill('admin@eatcaterly.com')
    await page.getByLabel('Password').fill('admin123')

    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin')
    await expect(page.getByText('SMS Food Delivery Admin')).toBeVisible()
  })

  test('login form validation', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('invalid email format validation', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('invalid credentials error', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('wrong@email.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('demo credentials are displayed', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText('Demo credentials:')).toBeVisible()
    await expect(page.getByText('admin@eatcaterly.com')).toBeVisible()
    await expect(page.getByText('admin123')).toBeVisible()
  })

  test('back to home navigation works', async ({ page }) => {
    await page.goto('/login')

    await page.getByText('← Back to Home').click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Food for every occasion.')).toBeVisible()
  })

  test('admin dashboard is protected', async ({ page }) => {
    // Try to access admin without login
    await page.goto('/admin')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('logout functionality works', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@eatcaterly.com')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page).toHaveURL('/admin')

    // Click logout
    await page.getByText('Sign out').click()

    // Should redirect to home or login
    await expect(page).toHaveURL('/')
  })
})