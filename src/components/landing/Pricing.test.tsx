import { render, screen } from '@testing-library/react'
import Pricing from './Pricing'

describe('Pricing', () => {
  it('renders the main heading', () => {
    render(<Pricing />)
    expect(screen.getByText('Simple, transparent pricing')).toBeInTheDocument()
  })

  it('renders the pricing description', () => {
    render(<Pricing />)
    expect(screen.getByText(/Choose the plan that fits your business/)).toBeInTheDocument()
    expect(screen.getByText(/Start free for 14 days, no credit card required/)).toBeInTheDocument()
  })

  it('displays Starter plan details', () => {
    render(<Pricing />)
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('$29')).toBeInTheDocument()
    expect(screen.getByText('/month')).toBeInTheDocument()
    expect(screen.getByText('Perfect for small food businesses and food trucks')).toBeInTheDocument()
  })

  it('displays Pro plan details', () => {
    render(<Pricing />)
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$79')).toBeInTheDocument()
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
    expect(screen.getByText('Ideal for restaurants and catering businesses')).toBeInTheDocument()
  })

  it('lists Starter plan features', () => {
    render(<Pricing />)
    expect(screen.getByText('Up to 100 customers')).toBeInTheDocument()
    expect(screen.getByText('Daily menu updates')).toBeInTheDocument()
    expect(screen.getByText('SMS ordering')).toBeInTheDocument()
    expect(screen.getByText('Basic payment processing')).toBeInTheDocument()
    expect(screen.getByText('Order management')).toBeInTheDocument()
    expect(screen.getByText('Email support')).toBeInTheDocument()
  })

  it('lists Pro plan features', () => {
    render(<Pricing />)
    expect(screen.getByText('Unlimited customers')).toBeInTheDocument()
    expect(screen.getByText('Advanced menu management')).toBeInTheDocument()
    expect(screen.getByText('SMS + email marketing')).toBeInTheDocument()
    expect(screen.getByText('Priority payment processing')).toBeInTheDocument()
    expect(screen.getByText('Event catering tools')).toBeInTheDocument()
    expect(screen.getByText('Analytics & reporting')).toBeInTheDocument()
    expect(screen.getByText('Priority support')).toBeInTheDocument()
    expect(screen.getByText('Custom branding')).toBeInTheDocument()
  })

  it('renders Start Free Trial buttons', () => {
    render(<Pricing />)
    const trialButtons = screen.getAllByText('Start Free Trial')
    expect(trialButtons).toHaveLength(2)
  })
})