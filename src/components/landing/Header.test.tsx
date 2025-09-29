import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders the EatCaterly logo', () => {
    render(<Header />)
    expect(screen.getByText('EatCaterly')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('How it works')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Testimonials')).toBeInTheDocument()
  })

  it('renders the Log in button', () => {
    render(<Header />)
    expect(screen.getByText('Log in')).toBeInTheDocument()
  })

  it('renders the Get Started Free button', () => {
    render(<Header />)
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
  })

  it('has proper navigation structure', () => {
    render(<Header />)
    const nav = screen.getByRole('banner')
    expect(nav).toBeInTheDocument()
  })
})