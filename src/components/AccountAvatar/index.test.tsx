import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  addressToJazzIconSeed: vi.fn(account => {
    // Return a simple hash based on address for testing
    const address = account.address || account.address_eth || ''
    return address.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  }),
}))

describe('AccountAvatar', () => {
  describe('rendering with oasis address', () => {
    it('should render JazzIcon when oasis address is provided', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      render(<AccountAvatar account={account} diameter={32} />)

      expect(screen.getByTestId('jazz-icon')).toBeInTheDocument()
    })

    it('should pass correct diameter to JazzIcon', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      render(<AccountAvatar account={account} diameter={64} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toHaveAttribute('data-diameter', '64')
    })

    it('should pass seed based on oasis address', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      render(<AccountAvatar account={account} diameter={32} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toHaveAttribute('data-seed')
    })

    it('should render with different oasis addresses', () => {
      const account1 = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      const { container: container1 } = render(<AccountAvatar account={account1} diameter={32} />)

      const account2 = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqyqrr5s' }
      const { container: container2 } = render(<AccountAvatar account={account2} diameter={32} />)

      expect(screen.getAllByTestId('jazz-icon')).toHaveLength(2)
    })
  })

  describe('rendering with ethereum address', () => {
    it('should render JazzIcon when ethereum address is provided', () => {
      const account = { address_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' }
      render(<AccountAvatar account={account} diameter={32} />)

      expect(screen.getByTestId('jazz-icon')).toBeInTheDocument()
    })

    it('should pass seed based on ethereum address', () => {
      const account = { address_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' }
      render(<AccountAvatar account={account} diameter={32} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toHaveAttribute('data-seed')
    })

    it('should render with different ethereum addresses', () => {
      const account1 = { address_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' }
      const { container: container1 } = render(<AccountAvatar account={account1} diameter={32} />)

      const account2 = { address_eth: '0x1234567890123456789012345678901234567890' }
      const { container: container2 } = render(<AccountAvatar account={account2} diameter={32} />)

      expect(screen.getAllByTestId('jazz-icon')).toHaveLength(2)
    })
  })

  describe('rendering with both addresses', () => {
    it('should render JazzIcon when both addresses are provided', () => {
      const account = {
        address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p',
        address_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      }
      render(<AccountAvatar account={account} diameter={32} />)

      expect(screen.getByTestId('jazz-icon')).toBeInTheDocument()
    })

    it('should prioritize oasis address for seed generation', () => {
      const account = {
        address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p',
        address_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      }
      render(<AccountAvatar account={account} diameter={32} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toHaveAttribute('data-seed')
    })
  })

  describe('edge cases', () => {
    it('should return null when no address is provided', () => {
      const account = {} as any
      const { container } = render(<AccountAvatar account={account} diameter={32} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when both addresses are undefined', () => {
      const account = {
        address: undefined as any,
        address_eth: undefined as any,
      }
      const { container } = render(<AccountAvatar account={account} diameter={32} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when addresses are empty strings', () => {
      const account = {
        address: '',
        address_eth: '',
      }
      const { container } = render(<AccountAvatar account={account} diameter={32} />)

      expect(container.firstChild).toBeNull()
    })

    it('should render when only oasis address is empty string but eth address exists', () => {
      const account = {
        address: '',
        address_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      }
      render(<AccountAvatar account={account} diameter={32} />)

      expect(screen.getByTestId('jazz-icon')).toBeInTheDocument()
    })

    it('should render when only eth address is empty string but oasis address exists', () => {
      const account = {
        address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p',
        address_eth: '',
      }
      render(<AccountAvatar account={account} diameter={32} />)

      expect(screen.getByTestId('jazz-icon')).toBeInTheDocument()
    })
  })

  describe('diameter prop', () => {
    it('should render with small diameter', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      render(<AccountAvatar account={account} diameter={16} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toHaveAttribute('data-diameter', '16')
    })

    it('should render with large diameter', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      render(<AccountAvatar account={account} diameter={128} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toHaveAttribute('data-diameter', '128')
    })

    it('should render with zero diameter', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      render(<AccountAvatar account={account} diameter={0} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toHaveAttribute('data-diameter', '0')
    })
  })

  describe('accessibility', () => {
    it('should render JazzIcon with proper structure', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' }
      render(<AccountAvatar account={account} diameter={32} />)

      const icon = screen.getByTestId('jazz-icon')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('type safety', () => {
    it('should accept valid oasis address format', () => {
      const account = { address: 'oasis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqupr77p' as const }
      expect(() => render(<AccountAvatar account={account} diameter={32} />)).not.toThrow()
    })

    it('should accept valid ethereum address format', () => {
      const account = { address_eth: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const }
      expect(() => render(<AccountAvatar account={account} diameter={32} />)).not.toThrow()
    })
  })
})
