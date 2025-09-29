import { render, screen } from '@testing-library/react'
import Testimonials from './Testimonials'

describe('Testimonials', () => {
  it('renders the main heading', () => {
    render(<Testimonials />)
    expect(screen.getByText('Loved by food professionals everywhere')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Testimonials />)
    expect(screen.getByText(/Join thousands of chefs, caterers, and food business owners/)).toBeInTheDocument()
  })

  it('displays the testimonial quote', () => {
    render(<Testimonials />)
    expect(screen.getByText(/EatCaterly transformed how I connect with customers/)).toBeInTheDocument()
    expect(screen.getByText(/My revenue increased 40% in just two months!/)).toBeInTheDocument()
  })

  it('displays the reviewer information', () => {
    render(<Testimonials />)
    expect(screen.getByText('Maria Rodriguez')).toBeInTheDocument()
    expect(screen.getByText("Chef & Owner, Maria's Kitchen")).toBeInTheDocument()
  })

  it('displays 5-star rating', () => {
    render(<Testimonials />)
    const stars = screen.getAllByText('★')
    expect(stars).toHaveLength(5)
  })

  it('has navigation dots for multiple testimonials', () => {
    render(<Testimonials />)
    const dots = screen.getAllByRole('button', { name: /testimonial/i })
    expect(dots.length).toBeGreaterThan(0)
  })
})