import { render, screen, fireEvent } from '@testing-library/react'
import FAQ from './FAQ'

describe('FAQ', () => {
  it('renders the main heading', () => {
    render(<FAQ />)
    expect(screen.getByText('Frequently asked questions')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<FAQ />)
    expect(screen.getByText(/Have questions\? We have answers/)).toBeInTheDocument()
    expect(screen.getByText(/feel free to contact our support team/)).toBeInTheDocument()
  })

  it('displays FAQ questions', () => {
    render(<FAQ />)
    expect(screen.getByText('How quickly can I get started?')).toBeInTheDocument()
    expect(screen.getByText('Do my customers need to download an app?')).toBeInTheDocument()
    expect(screen.getByText('What payment methods do you support?')).toBeInTheDocument()
    expect(screen.getByText('Can I customize my menus for different events?')).toBeInTheDocument()
    expect(screen.getByText('Is there a limit on the number of customers I can reach?')).toBeInTheDocument()
    expect(screen.getByText('What kind of support do you provide?')).toBeInTheDocument()
  })

  it('expands and collapses FAQ items when clicked', () => {
    render(<FAQ />)
    const firstQuestion = screen.getByText('How quickly can I get started?')

    // Initially collapsed
    expect(screen.queryByText(/You can get started in just a few minutes/)).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(firstQuestion)
    expect(screen.getByText(/You can get started in just a few minutes/)).toBeInTheDocument()

    // Click to collapse
    fireEvent.click(firstQuestion)
    expect(screen.queryByText(/You can get started in just a few minutes/)).not.toBeInTheDocument()
  })

  it('shows expanded answer for support question', () => {
    render(<FAQ />)
    const supportQuestion = screen.getByText('What kind of support do you provide?')

    fireEvent.click(supportQuestion)
    expect(screen.getByText(/We offer email support for all users/)).toBeInTheDocument()
    expect(screen.getByText(/priority support for Pro plan customers/)).toBeInTheDocument()
  })
})