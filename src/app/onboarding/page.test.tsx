import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import OnboardingPage from './page'

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
      firstName: 'John',
      lastName: 'Doe',
    },
    isLoaded: true,
  })),
}))

describe('OnboardingPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    global.fetch = jest.fn()
  })

  it('renders the onboarding form', () => {
    render(<OnboardingPage />)

    expect(screen.getByText(/Complete Your Business Profile/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contact Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Zip Code/i)).toBeInTheDocument()
  })

  it('pre-fills email and name from Clerk user data', () => {
    render(<OnboardingPage />)

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const nameInput = screen.getByLabelText(/Contact Name/i) as HTMLInputElement

    expect(emailInput.value).toBe('test@example.com')
    expect(nameInput.value).toBe('John Doe')
  })

  it('validates zip code is 5 digits', async () => {
    render(<OnboardingPage />)

    const zipInput = screen.getByLabelText(/Zip Code/i)
    const businessInput = screen.getByLabelText(/Business Name/i)
    const submitButton = screen.getByRole('button', { name: /Continue/i })

    fireEvent.change(businessInput, { target: { value: 'Test Restaurant' } })
    fireEvent.change(zipInput, { target: { value: '123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/valid 5-digit zip code/i)).toBeInTheDocument()
    })
  })

  it('shows error for unsupported zip code', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Zip code 12345 is not currently supported. We serve the Atlanta metro area.'
      }),
    })

    render(<OnboardingPage />)

    const zipInput = screen.getByLabelText(/Zip Code/i)
    const businessInput = screen.getByLabelText(/Business Name/i)
    const submitButton = screen.getByRole('button', { name: /Continue/i })

    fireEvent.change(businessInput, { target: { value: 'Test Restaurant' } })
    fireEvent.change(zipInput, { target: { value: '12345' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      // Look for error message in the error alert box (bg-red-50)
      const errorBox = document.querySelector('.bg-red-50')
      expect(errorBox).toBeInTheDocument()
      expect(errorBox).toHaveTextContent(/not currently supported/i)
    })
  })

  it('shows assigned phone number on successful submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          businessId: 'biz_123',
          businessName: 'Test Restaurant',
          assignedPhoneNumber: '404-555-0123',
          areaCode: '404',
          location: {
            city: 'Atlanta',
            state: 'GA'
          }
        }
      }),
    })

    render(<OnboardingPage />)

    const businessInput = screen.getByLabelText(/Business Name/i)
    const zipInput = screen.getByLabelText(/Zip Code/i)
    const submitButton = screen.getByRole('button', { name: /Continue/i })

    fireEvent.change(businessInput, { target: { value: 'Test Restaurant' } })
    fireEvent.change(zipInput, { target: { value: '30309' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/404-555-0123/)).toBeInTheDocument()
      expect(screen.getByText(/Your A2P-Compliant Phone Number/i)).toBeInTheDocument()
      expect(screen.getByText(/Atlanta, GA/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: {} })
      }), 100))
    )

    render(<OnboardingPage />)

    const businessInput = screen.getByLabelText(/Business Name/i)
    const zipInput = screen.getByLabelText(/Zip Code/i)
    const submitButton = screen.getByRole('button', { name: /Continue/i })

    fireEvent.change(businessInput, { target: { value: 'Test Restaurant' } })
    fireEvent.change(zipInput, { target: { value: '30309' } })
    fireEvent.click(submitButton)

    expect(screen.getByText(/Assigning your number/i)).toBeInTheDocument()
  })

  it('redirects to plan selection after successful phone assignment', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          businessId: 'biz_123',
          businessName: 'Test Restaurant',
          assignedPhoneNumber: '404-555-0123',
          areaCode: '404',
          location: {
            city: 'Atlanta',
            state: 'GA'
          }
        }
      }),
    })

    render(<OnboardingPage />)

    const businessInput = screen.getByLabelText(/Business Name/i)
    const zipInput = screen.getByLabelText(/Zip Code/i)
    const submitButton = screen.getByRole('button', { name: /Continue/i })

    fireEvent.change(businessInput, { target: { value: 'Test Restaurant' } })
    fireEvent.change(zipInput, { target: { value: '30309' } })
    fireEvent.click(submitButton)

    // Wait for success screen and click continue button
    await waitFor(() => {
      expect(screen.getByText(/404-555-0123/)).toBeInTheDocument()
    }, { timeout: 3000 })

    const continueButton = screen.getByRole('button', { name: /Continue to Plan Selection/i })
    fireEvent.click(continueButton)

    expect(mockPush).toHaveBeenCalledWith('/onboarding/plan')
  })

  it('requires all fields before submission', () => {
    render(<OnboardingPage />)

    const submitButton = screen.getByRole('button', { name: /Continue/i })

    expect(submitButton).toBeDisabled()

    // Fill in business name
    const businessInput = screen.getByLabelText(/Business Name/i)
    fireEvent.change(businessInput, { target: { value: 'Test Restaurant' } })

    expect(submitButton).toBeDisabled()

    // Fill in zip code
    const zipInput = screen.getByLabelText(/Zip Code/i)
    fireEvent.change(zipInput, { target: { value: '30309' } })

    expect(submitButton).not.toBeDisabled()
  })

  it('displays onboarding progress indicator', () => {
    render(<OnboardingPage />)

    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument()
    expect(screen.getByText(/Business Information/i)).toBeInTheDocument()
  })
})
