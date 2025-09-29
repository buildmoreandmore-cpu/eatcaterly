import { render, screen } from '@testing-library/react'
import LoginPage from './page'

// Mock the LoginForm component
jest.mock('../../components/auth/LoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form Component</div>
  }
})

describe('LoginPage', () => {
  it('renders the login page layout', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your EatCaterly account')).toBeInTheDocument()
  })

  it('renders the login form', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('has a link back to home page', () => {
    render(<LoginPage />)
    expect(screen.getByText('← Back to Home')).toBeInTheDocument()
  })

  it('displays the EatCaterly logo', () => {
    render(<LoginPage />)
    expect(screen.getByText('EatCaterly')).toBeInTheDocument()
  })

  it('has proper page structure for accessibility', () => {
    render(<LoginPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})