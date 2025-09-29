import { render, screen } from '@testing-library/react'
import Hero from './Hero'

describe('Hero', () => {
  it('renders the main headline', () => {
    render(<Hero />)
    expect(screen.getByText('Catering.')).toBeInTheDocument()
    expect(screen.getByText('Made simple.')).toBeInTheDocument()
  })

  it('renders the descriptive text', () => {
    render(<Hero />)
    expect(screen.getByText(/platform that lets chefs, caterers, and food businesses/)).toBeInTheDocument()
    expect(screen.getByText(/share daily menus, send them by text, and accept payments/)).toBeInTheDocument()
  })

  it('renders the menu preview card', () => {
    render(<Hero />)
    expect(screen.getByText("Today's Menu")).toBeInTheDocument()
    expect(screen.getByText("Chef Maria's Kitchen")).toBeInTheDocument()
  })

  it('displays menu items with prices', () => {
    render(<Hero />)
    expect(screen.getByText('Grilled Salmon')).toBeInTheDocument()
    expect(screen.getByText('$24')).toBeInTheDocument()
    expect(screen.getByText('Pasta Primavera')).toBeInTheDocument()
    expect(screen.getByText('$18')).toBeInTheDocument()
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
    expect(screen.getByText('$12')).toBeInTheDocument()
  })

  it('renders the Order Now button', () => {
    render(<Hero />)
    expect(screen.getByText('Order Now')).toBeInTheDocument()
  })

  it('renders CTA buttons', () => {
    render(<Hero />)
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
    expect(screen.getByText('Watch Demo')).toBeInTheDocument()
  })

  it('displays trial information', () => {
    render(<Hero />)
    expect(screen.getByText('Free 14-day trial')).toBeInTheDocument()
    expect(screen.getByText('No credit card required')).toBeInTheDocument()
  })

  it('renders the menu card with wider size classes', () => {
    const { container } = render(<Hero />)
    const menuCard = container.querySelector('[data-testid="menu-card"]')

    // Test will fail initially until we make the card wider not taller
    expect(menuCard).toHaveClass('max-w-3xl') // Expecting 3xl for wider size
    expect(menuCard).toHaveClass('p-10') // Expecting normal padding (not too tall)
  })
})