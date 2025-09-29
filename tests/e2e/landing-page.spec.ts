import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct title and meta information', async ({ page }) => {
    await expect(page).toHaveTitle(/EatCaterly/)
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain('food business')
  })

  test('renders header navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByText('Features')).toBeVisible()
    await expect(page.getByText('How it works')).toBeVisible()
    await expect(page.getByText('Pricing')).toBeVisible()
    await expect(page.getByText('Testimonials')).toBeVisible()
    await expect(page.getByText('Log in')).toBeVisible()
    await expect(page.getByText('Get Started Free')).toBeVisible()
  })

  test('hero section displays correctly', async ({ page }) => {
    await expect(page.getByText('Food for every occasion.')).toBeVisible()
    await expect(page.getByText('Made simple.')).toBeVisible()
    await expect(page.getByText("Today's Menu")).toBeVisible()
    await expect(page.getByText('Order Now')).toBeVisible()
  })

  test('features section displays all three features', async ({ page }) => {
    await expect(page.getByText('Post Daily Menus')).toBeVisible()
    await expect(page.getByText('Text & Collect Orders')).toBeVisible()
    await expect(page.getByText('Plan Event Catering')).toBeVisible()
  })

  test('how it works section shows 3 steps', async ({ page }) => {
    await expect(page.getByText('How it works')).toBeVisible()
    await expect(page.getByText('01')).toBeVisible()
    await expect(page.getByText('02')).toBeVisible()
    await expect(page.getByText('03')).toBeVisible()
  })

  test('pricing section displays both plans', async ({ page }) => {
    await expect(page.getByText('Simple, transparent pricing')).toBeVisible()
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
    await expect(page.getByText('$29')).toBeVisible()
    await expect(page.getByText('$79')).toBeVisible()
  })

  test('FAQ section is interactive', async ({ page }) => {
    const faqQuestion = page.getByText('How quickly can I get started?')
    await expect(faqQuestion).toBeVisible()

    // Click to expand
    await faqQuestion.click()
    await expect(page.getByText(/You can get started in just a few minutes/)).toBeVisible()
  })

  test('footer contains all required links', async ({ page }) => {
    await expect(page.getByText('Product')).toBeVisible()
    await expect(page.getByText('Company')).toBeVisible()
    await expect(page.getByText('Support')).toBeVisible()
    await expect(page.getByText('© 2025 EatCaterly')).toBeVisible()
  })

  test('navigation to login page works', async ({ page }) => {
    await page.getByText('Log in').first().click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('get started button works', async ({ page }) => {
    await page.getByText('Get Started Free').first().click()
    await expect(page).toHaveURL('/login')
  })

  test('scroll behavior and section anchors work', async ({ page }) => {
    // Test navigation to pricing section
    await page.getByText('Pricing').click()
    await expect(page.locator('#pricing')).toBeInViewport()
  })

  test('responsive design works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('EatCaterly')).toBeVisible()
    await expect(page.getByText('Food for every occasion.')).toBeVisible()
  })
})