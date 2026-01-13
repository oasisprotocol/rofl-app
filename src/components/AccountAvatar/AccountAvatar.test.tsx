import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AccountAvatar } from './index'

// Mock the JazzIcon component
vi.mock('../JazzIcon', () => ({
  JazzIcon: ({ diameter, seed }: { diameter: number; seed: number }) => (
    <div data-testid="jazz-icon" data-diameter={diameter} data-seed={seed}>
      JazzIcon
    </div>
  ),
}))

// Mock the addressToJazzIconSeed function
vi.mock('../JazzIcon/addressToJazzIconSeed', () => ({
  addressToJazzIconSeed: vi.fn(_account => 12345),
}))

describe('AccountAvatar', () => {
  it('renders JazzIcon when oasis address is provided', () => {
    const account = {
      address: 'oasis1qqqw0xfke7mzwzhmfndd3mnmhssr89qt8xhcy0t' as `oasis1${string}`,
    }

    const { getByTestId } = render(<AccountAvatar account={account} diameter={32} />)

    expect(getByTestId('jazz-icon')).toBeInTheDocument()
    expect(getByTestId('jazz-icon')).toHaveAttribute('data-diameter', '32')
  })

  it('renders JazzIcon when ETH address is provided', () => {
    const account = {
      address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
    }

    const { getByTestId } = render(<AccountAvatar account={account} diameter={32} />)

    expect(getByTestId('jazz-icon')).toBeInTheDocument()
  })

  it('renders JazzIcon when both addresses are provided', () => {
    const account = {
      address: 'oasis1qqqw0xfke7mzwzhmfndd3mnmhssr89qt8xhcy0t' as `oasis1${string}`,
      address_eth: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
    }

    const { getByTestId } = render(<AccountAvatar account={account} diameter={48} />)

    expect(getByTestId('jazz-icon')).toBeInTheDocument()
  })

  it('renders with correct diameter', () => {
    const account = {
      address: 'oasis1qqqw0xfke7mzwzhmfndd3mnmhssr89qt8xhcy0t' as `oasis1${string}`,
    }

    const { getByTestId } = render(<AccountAvatar account={account} diameter={64} />)

    expect(getByTestId('jazz-icon')).toHaveAttribute('data-diameter', '64')
  })

  it('returns null when no address is provided', () => {
    const account = {
      address: undefined as `oasis1${string}` | undefined,
      address_eth: undefined as `0x${string}` | undefined,
    }

    const { container } = render(<AccountAvatar account={account} diameter={32} />)

    expect(container.firstChild).toBeNull()
  })
})
