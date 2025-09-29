import { render, screen } from '@testing-library/react'
import HowItWorks from './HowItWorks'

describe('HowItWorks', () => {
  it('renders the main heading', () => {
    render(<HowItWorks />)
    expect(screen.getByText('How it works')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<HowItWorks />)
    expect(screen.getByText(/Get started in minutes. No complex setup, no lengthy onboarding/)).toBeInTheDocument()
  })

  it('displays step 1 - Create Your Menu', () => {
    render(<HowItWorks />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('Create Your Menu')).toBeInTheDocument()
    expect(screen.getByText(/Add your dishes, prices, and photos/)).toBeInTheDocument()
  })

  it('displays step 2 - Send to Customers', () => {
    render(<HowItWorks />)
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('Send to Customers')).toBeInTheDocument()
    expect(screen.getByText(/Share your menu via text message/)).toBeInTheDocument()
  })

  it('displays step 3 - Receive & Fulfill Orders', () => {
    render(<HowItWorks />)
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('Receive & Fulfill Orders')).toBeInTheDocument()
    expect(screen.getByText(/Get orders with payment confirmation/)).toBeInTheDocument()
  })

  it('has proper section structure', () => {
    render(<HowItWorks />)
    const section = screen.getByRole('region')
    expect(section).toBeInTheDocument()
  })
})