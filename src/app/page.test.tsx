import { render, screen } from '@testing-library/react'
import Page from './page'

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Page />)

    // Should render the page without errors
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('displays the welcome message', () => {
    render(<Page />)

    // Check for main heading specifically
    expect(screen.getByRole('heading', { level: 1, name: /SMS Food Delivery/i })).toBeInTheDocument()
  })
})