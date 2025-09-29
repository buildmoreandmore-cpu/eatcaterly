import { render, screen } from '@testing-library/react'
import Features from './Features'

describe('Features', () => {
  it('renders the main features heading', () => {
    render(<Features />)
    expect(screen.getByText('Everything you need to grow your food business')).toBeInTheDocument()
  })

  it('renders the features description', () => {
    render(<Features />)
    expect(screen.getByText(/From daily specials to large events, EatCaterly handles it all/)).toBeInTheDocument()
  })

  it('displays Post Daily Menus feature', () => {
    render(<Features />)
    expect(screen.getByText('Post Daily Menus')).toBeInTheDocument()
    expect(screen.getByText(/Easily create and share your daily specials/)).toBeInTheDocument()
  })

  it('displays Text & Collect Orders feature', () => {
    render(<Features />)
    expect(screen.getByText('Text & Collect Orders')).toBeInTheDocument()
    expect(screen.getByText(/Send menus directly to customers via SMS/)).toBeInTheDocument()
  })

  it('displays Plan Event Catering feature', () => {
    render(<Features />)
    expect(screen.getByText('Plan Event Catering')).toBeInTheDocument()
    expect(screen.getByText(/Manage large orders for events, parties, and corporate catering/)).toBeInTheDocument()
  })

  it('has proper section structure', () => {
    render(<Features />)
    const section = screen.getByRole('region')
    expect(section).toBeInTheDocument()
  })
})