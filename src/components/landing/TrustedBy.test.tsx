import { render, screen } from '@testing-library/react'
import TrustedBy from './TrustedBy'

describe('TrustedBy', () => {
  it('renders the trusted by heading', () => {
    render(<TrustedBy />)
    expect(screen.getByText('TRUSTED BY FOOD BUSINESSES EVERYWHERE')).toBeInTheDocument()
  })

  it('displays all business types', () => {
    render(<TrustedBy />)
    expect(screen.getByText('Local Bistro')).toBeInTheDocument()
    expect(screen.getByText("Chef's Table")).toBeInTheDocument()
    expect(screen.getByText('Garden Fresh')).toBeInTheDocument()
    expect(screen.getByText('Spice Route')).toBeInTheDocument()
    expect(screen.getByText('Sweet Treats')).toBeInTheDocument()
    expect(screen.getByText('Ocean Grill')).toBeInTheDocument()
  })

  it('has proper section structure', () => {
    render(<TrustedBy />)
    const section = screen.getByRole('region')
    expect(section).toBeInTheDocument()
  })
})