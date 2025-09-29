import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from './LoginForm'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe('LoginForm', () => {
  it('renders login form elements', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<LoginForm />)
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<LoginForm />)
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    // Mock fetch to simulate delay
    global.fetch = jest.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      }), 100))
    )

    render(<LoginForm />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
  })

  it('displays error message for invalid credentials', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    })

    render(<LoginForm />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('has demo credentials hint', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Demo credentials:/)).toBeInTheDocument()
    expect(screen.getByText(/admin@eatcaterly\.com/)).toBeInTheDocument()
    expect(screen.getByText(/admin123/)).toBeInTheDocument()
  })
})