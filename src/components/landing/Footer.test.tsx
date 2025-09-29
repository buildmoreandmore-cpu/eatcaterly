import { render, screen } from '@testing-library/react'
import Footer from './Footer'

describe('Footer', () => {
  it('renders the EatCaterly logo and description', () => {
    render(<Footer />)
    expect(screen.getByText('EatCaterly')).toBeInTheDocument()
    expect(screen.getByText(/The platform that lets chefs, caterers, and food businesses/)).toBeInTheDocument()
  })

  it('displays Product section links', () => {
    render(<Footer />)
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Integrations')).toBeInTheDocument()
    expect(screen.getByText('API')).toBeInTheDocument()
  })

  it('displays Company section links', () => {
    render(<Footer />)
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Careers')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('displays Support section links', () => {
    render(<Footer />)
    expect(screen.getByText('Support')).toBeInTheDocument()
    expect(screen.getByText('Help Center')).toBeInTheDocument()
    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('displays social media links', () => {
    render(<Footer />)
    const socialLinks = screen.getAllByRole('link')
    const socialMediaLinks = socialLinks.filter(link =>
      link.getAttribute('aria-label')?.includes('social') ||
      link.getAttribute('href')?.includes('twitter') ||
      link.getAttribute('href')?.includes('pinterest') ||
      link.getAttribute('href')?.includes('instagram')
    )
    expect(socialMediaLinks.length).toBeGreaterThanOrEqual(3)
  })

  it('displays copyright information', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2025 EatCaterly. All rights reserved./)).toBeInTheDocument()
  })

  it('displays Terms of Service and Privacy Policy links', () => {
    render(<Footer />)
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('renders the Get Started Free button', () => {
    render(<Footer />)
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
  })
})