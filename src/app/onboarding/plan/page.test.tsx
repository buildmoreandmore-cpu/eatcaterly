import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import PlanSelectionPage from './page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
  })),
}))

describe('PlanSelectionPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    global.fetch = jest.fn()
  })

  it('renders the plan selection page', () => {
    render(<PlanSelectionPage />)

    expect(screen.getByText(/Choose Your Plan/i)).toBeInTheDocument()
    expect(screen.getByText(/Select the plan that best fits your business/i)).toBeInTheDocument()
  })

  it('displays Starter plan with correct pricing', () => {
    render(<PlanSelectionPage />)

    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('$65')).toBeInTheDocument()
    const perMonthLabels = screen.getAllByText(/per month/i)
    expect(perMonthLabels.length).toBeGreaterThan(0)
    expect(screen.getByText(/Perfect for small food businesses/i)).toBeInTheDocument()
  })

  it('displays Pro plan with correct pricing', () => {
    render(<PlanSelectionPage />)

    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$125')).toBeInTheDocument()
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
    expect(screen.getByText(/Ideal for restaurants and catering/i)).toBeInTheDocument()
  })

  it('shows A2P phone number included in both plans', () => {
    render(<PlanSelectionPage />)

    const a2pFeatures = screen.getAllByText(/A2P-compliant phone number/i)
    expect(a2pFeatures.length).toBeGreaterThanOrEqual(2)
  })

  it('displays Starter plan features', () => {
    render(<PlanSelectionPage />)

    expect(screen.getByText(/Up to 100 customers/i)).toBeInTheDocument()
    expect(screen.getByText(/Daily menu updates/i)).toBeInTheDocument()
    expect(screen.getByText(/SMS ordering/i)).toBeInTheDocument()
    expect(screen.getByText(/Basic payment processing/i)).toBeInTheDocument()
  })

  it('displays Pro plan features', () => {
    render(<PlanSelectionPage />)

    expect(screen.getByText(/Unlimited customers/i)).toBeInTheDocument()
    expect(screen.getByText(/Advanced menu management/i)).toBeInTheDocument()
    expect(screen.getByText(/Priority support/i)).toBeInTheDocument()
    expect(screen.getByText(/Analytics & reporting/i)).toBeInTheDocument()
  })

  it('displays progress indicator for step 2', () => {
    render(<PlanSelectionPage />)

    expect(screen.getByText(/Step 2 of 2/i)).toBeInTheDocument()
    expect(screen.getByText(/Plan Selection/i)).toBeInTheDocument()
  })

  it('allows selecting Starter plan', async () => {
    render(<PlanSelectionPage />)

    const starterButtons = screen.getAllByRole('button', { name: /Select Starter/i })
    fireEvent.click(starterButtons[0])

    await waitFor(() => {
      // Button should show selected state
      expect(starterButtons[0]).toHaveTextContent(/Selected/i)
    })
  })

  it('allows selecting Pro plan', async () => {
    render(<PlanSelectionPage />)

    const proButtons = screen.getAllByRole('button', { name: /Select Pro/i })
    fireEvent.click(proButtons[0])

    await waitFor(() => {
      // Button should show selected state
      expect(proButtons[0]).toHaveTextContent(/Selected/i)
    })
  })

  it('highlights selected plan card', () => {
    render(<PlanSelectionPage />)

    const starterButtons = screen.getAllByRole('button', { name: /Select Starter/i })
    fireEvent.click(starterButtons[0])

    // The card should have visual indication (border or background change)
    const starterCard = starterButtons[0].closest('.plan-card')
    expect(starterCard).toHaveClass(/selected|border-blue|ring/)
  })

  it('shows continue button after plan selection', async () => {
    render(<PlanSelectionPage />)

    const starterButtons = screen.getAllByRole('button', { name: /Select Starter/i })
    fireEvent.click(starterButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Continue to Payment/i })).toBeInTheDocument()
    })
  })

  it('saves selected plan and redirects to Stripe checkout', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        checkoutUrl: 'https://checkout.stripe.com/session_123'
      }),
    })

    // Mock window.location.href
    delete (window as any).location
    ;(window as any).location = { href: '' }

    render(<PlanSelectionPage />)

    const starterButtons = screen.getAllByRole('button', { name: /Select Starter/i })
    fireEvent.click(starterButtons[0])

    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /Continue to Payment/i })
      expect(continueButton).toBeInTheDocument()
      fireEvent.click(continueButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/create-checkout',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('starter')
        })
      )
    })
  })

  it('shows loading state during checkout creation', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, checkoutUrl: 'https://checkout.stripe.com/session_123' })
      }), 100))
    )

    render(<PlanSelectionPage />)

    const starterButtons = screen.getAllByRole('button', { name: /Select Starter/i })
    fireEvent.click(starterButtons[0])

    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /Continue to Payment/i })
      fireEvent.click(continueButton)
    })

    expect(screen.getByText(/Creating checkout/i)).toBeInTheDocument()
  })

  it('displays error if checkout creation fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Failed to create checkout session'
      }),
    })

    render(<PlanSelectionPage />)

    const proButtons = screen.getAllByRole('button', { name: /Select Pro/i })
    fireEvent.click(proButtons[0])

    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /Continue to Payment/i })
      fireEvent.click(continueButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Failed to create checkout/i)).toBeInTheDocument()
    })
  })

  it('compares Starter and Pro plan differences', () => {
    render(<PlanSelectionPage />)

    // Starter has 100 customers limit
    expect(screen.getByText(/Up to 100 customers/i)).toBeInTheDocument()

    // Pro has unlimited customers
    expect(screen.getByText(/Unlimited customers/i)).toBeInTheDocument()

    // Price difference
    expect(screen.getByText('$65')).toBeInTheDocument()
    expect(screen.getByText('$125')).toBeInTheDocument()
  })

  it('shows money-back guarantee or trial info', () => {
    render(<PlanSelectionPage />)

    // Check for any of these phrases
    const page = document.body.textContent || ''
    const hasTrialInfo = page.includes('14-day free trial') ||
                         page.includes('14-Day Free Trial') ||
                         page.includes('Money-Back Guarantee') ||
                         page.includes('Cancel anytime')
    expect(hasTrialInfo).toBe(true)
  })

  it('displays secure payment badge', () => {
    render(<PlanSelectionPage />)

    // Check for secure payment info
    expect(screen.getByText(/Secure Payment/i)).toBeInTheDocument()
    expect(screen.getByText(/Powered by Stripe/i)).toBeInTheDocument()
  })
})
