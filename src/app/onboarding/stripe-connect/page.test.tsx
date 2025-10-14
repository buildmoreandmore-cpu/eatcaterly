import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import StripeConnectOnboardingPage from './page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
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

describe('StripeConnectOnboardingPage', () => {
  const mockPush = jest.fn()
  const mockSearchParams = {
    get: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset search params to return null by default
    mockSearchParams.get.mockReturnValue(null)
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    global.fetch = jest.fn()
  })

  it('renders the Stripe Connect explanation page', () => {
    render(<StripeConnectOnboardingPage />)

    expect(screen.getByText(/Connect Your Stripe Account/i)).toBeInTheDocument()
    expect(screen.getByText(/accept payments from your customers/i)).toBeInTheDocument()
  })

  it('displays progress indicator for step 2', () => {
    render(<StripeConnectOnboardingPage />)

    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Payment Setup/i)).toBeInTheDocument()
  })

  it('shows benefits of Stripe Connect', () => {
    render(<StripeConnectOnboardingPage />)

    expect(screen.getByText(/Direct bank deposits/i)).toBeInTheDocument()
    const securePayment = screen.getAllByText(/Secure payment processing/i)
    expect(securePayment.length).toBeGreaterThan(0)
    expect(screen.getByText(/Access to Stripe Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Automatic payouts/i)).toBeInTheDocument()
  })

  it('displays connect to Stripe button', () => {
    render(<StripeConnectOnboardingPage />)

    const connectButton = screen.getByRole('button', { name: /Connect with Stripe/i })
    expect(connectButton).toBeInTheDocument()
  })

  it('creates Stripe Connect account and redirects to onboarding', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accountId: 'acct_123',
        onboardingUrl: 'https://connect.stripe.com/setup/123',
      }),
    })

    render(<StripeConnectOnboardingPage />)

    const connectButton = screen.getByRole('button', { name: /Connect with Stripe/i })
    fireEvent.click(connectButton)

    // Verify API is called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stripe-connect/create-account',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com'),
        })
      )
    })

    // Verify it returns the onboarding URL (redirect happens in browser)
    const call = (global.fetch as jest.Mock).mock.calls[0]
    expect(call).toBeDefined()
  })

  it('shows loading state during account creation', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  accountId: 'acct_123',
                  onboardingUrl: 'https://connect.stripe.com/setup/123',
                }),
              }),
            100
          )
        )
    )

    render(<StripeConnectOnboardingPage />)

    const connectButton = screen.getByRole('button', { name: /Connect with Stripe/i })
    fireEvent.click(connectButton)

    expect(screen.getByText(/Creating your Stripe account/i)).toBeInTheDocument()
  })

  it('displays error if account creation fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Failed to create Stripe account',
      }),
    })

    render(<StripeConnectOnboardingPage />)

    const connectButton = screen.getByRole('button', { name: /Connect with Stripe/i })
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to create Stripe account/i)).toBeInTheDocument()
    })
  })

  it('handles return from Stripe onboarding with success', async () => {
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'return') return 'true'
      if (param === 'account_id') return 'acct_123'
      return null
    })

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accountId: 'acct_123',
        onboardingComplete: true,
        chargesEnabled: true,
        payoutsEnabled: true,
      }),
    })

    render(<StripeConnectOnboardingPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe-connect/check-status?accountId=acct_123')
    })

    await waitFor(() => {
      expect(screen.getByText(/Stripe Account Connected Successfully/i)).toBeInTheDocument()
    })
  })

  it('shows incomplete onboarding message if Stripe setup not finished', async () => {
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'return') return 'true'
      if (param === 'account_id') return 'acct_123'
      return null
    })

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accountId: 'acct_123',
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }),
    })

    render(<StripeConnectOnboardingPage />)

    await waitFor(() => {
      expect(screen.getByText(/Onboarding Incomplete/i)).toBeInTheDocument()
      expect(screen.getByText(/finish setting up your Stripe account/i)).toBeInTheDocument()
    })
  })

  it('allows continuing to plan selection after successful onboarding', async () => {
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'return') return 'true'
      if (param === 'account_id') return 'acct_123'
      return null
    })

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accountId: 'acct_123',
        onboardingComplete: true,
        chargesEnabled: true,
        payoutsEnabled: true,
      }),
    })

    render(<StripeConnectOnboardingPage />)

    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /Continue to Plan Selection/i })
      expect(continueButton).toBeInTheDocument()
      fireEvent.click(continueButton)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding/plan')
    })
  })

  it('provides refresh link for incomplete onboarding', async () => {
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'return') return 'true'
      if (param === 'account_id') return 'acct_123'
      return null
    })

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          accountId: 'acct_123',
          onboardingComplete: false,
          chargesEnabled: false,
          payoutsEnabled: false,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          onboardingUrl: 'https://connect.stripe.com/setup/123/refresh',
        }),
      })

    render(<StripeConnectOnboardingPage />)

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /Continue Setup/i })
      expect(refreshButton).toBeInTheDocument()
      fireEvent.click(refreshButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stripe-connect/refresh-onboarding',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('acct_123'),
        })
      )
    })
  })

  it('shows skip option with warning', () => {
    render(<StripeConnectOnboardingPage />)

    const skipButton = screen.getByRole('button', { name: /Skip for now/i })
    expect(skipButton).toBeInTheDocument()
    expect(screen.getByText(/You'll need to complete this before accepting payments/i)).toBeInTheDocument()
  })

  it('allows skipping and navigates to plan selection', async () => {
    render(<StripeConnectOnboardingPage />)

    const skipButton = screen.getByRole('button', { name: /Skip for now/i })
    fireEvent.click(skipButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding/plan')
    })
  })

  it('displays Stripe branding and security info', () => {
    render(<StripeConnectOnboardingPage />)

    expect(screen.getByText('Powered by Stripe')).toBeInTheDocument()
    expect(screen.getByText('Secure')).toBeInTheDocument()
    expect(screen.getByText('Bank-level security')).toBeInTheDocument()
  })

  it('shows what information Stripe will collect', () => {
    render(<StripeConnectOnboardingPage />)

    expect(screen.getByText(/What you'll need:/i)).toBeInTheDocument()
    expect(screen.getByText(/Business information \(name, address, tax ID\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Bank account details for deposits/i)).toBeInTheDocument()
    expect(screen.getByText(/Tax identification number \(EIN or SSN\)/i)).toBeInTheDocument()
  })

  it('displays platform fee information', () => {
    render(<StripeConnectOnboardingPage />)

    expect(screen.getByText(/Payment Processing Fees/i)).toBeInTheDocument()
    expect(screen.getByText(/2\.9% \+ \$0\.30 per transaction/i)).toBeInTheDocument()
    expect(screen.getByText(/platform fee of 2%/i)).toBeInTheDocument()
  })
})
