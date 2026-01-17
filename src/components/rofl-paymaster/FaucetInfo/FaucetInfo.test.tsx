import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FaucetInfo } from './index'

// Mock the FAUCET_URL constant
vi.mock('../../../constants/global', () => ({
  FAUCET_URL: 'https://faucet.test.oasis.sh',
}))

describe('FaucetInfo', () => {
  it('renders the component', () => {
    render(<FaucetInfo />)

    expect(screen.getByText('Need $TEST Tokens?')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<FaucetInfo />)

    expect(screen.getByText(/You're currently on the testnet/)).toBeInTheDocument()
  })

  it('renders link to faucet', () => {
    render(<FaucetInfo />)

    const link = screen.getByRole('link', { name: /Open Testnet Faucet/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://faucet.test.oasis.sh')
  })

  it('opens faucet link in new tab', () => {
    render(<FaucetInfo />)

    const link = screen.getByRole('link', { name: /Open Testnet Faucet/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders ExternalLink icon', () => {
    render(<FaucetInfo />)

    // Check if svg icon is present
    const svg = screen.getByRole('link').querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
