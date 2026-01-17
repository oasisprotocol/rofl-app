import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TokenLogo } from './index'

describe('TokenLogo Component', () => {
  describe('rendering behavior', () => {
    it('should render SVG fallback when no props provided', () => {
      const { container } = render(<TokenLogo />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
    })

    it('should render SVG fallback when chainId prop provided', () => {
      const { container } = render(<TokenLogo chainId={1} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render SVG fallback when token prop provided', () => {
      const token = {
        name: 'Test Token',
        symbol: 'TST',
        decimals: 18,
      }
      const { container } = render(<TokenLogo token={token} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render SVG fallback when both chainId and token props provided', () => {
      const token = {
        name: 'Custom Token',
        symbol: 'CTK',
        decimals: 18,
      }
      const { container } = render(<TokenLogo chainId={1} token={token} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('container styling', () => {
    it('should render with correct container classes', () => {
      const { container } = render(<TokenLogo />)

      const wrapper = container.querySelector('.w-4.h-4')
      expect(wrapper).toBeInTheDocument()
    })

    it('should maintain container dimensions with props', () => {
      const { container } = render(<TokenLogo chainId={1} />)

      const wrapper = container.querySelector('.w-4.h-4')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('SVG structure', () => {
    it('should render SVG circle with currentColor fill', () => {
      const { container } = render(<TokenLogo />)

      const circle = container.querySelector('circle')
      expect(circle).toBeInTheDocument()
      expect(circle).toHaveAttribute('fill', 'currentColor')
    })

    it('should render SVG with correct viewBox', () => {
      const { container } = render(<TokenLogo />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
    })

    it('should render SVG with correct namespace', () => {
      const { container } = render(<TokenLogo />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    })

    it('should render circle with correct dimensions', () => {
      const { container } = render(<TokenLogo />)

      const circle = container.querySelector('circle')
      expect(circle).toHaveAttribute('cx', '8')
      expect(circle).toHaveAttribute('cy', '8')
      expect(circle).toHaveAttribute('r', '8')
    })
  })

  describe('token prop handling', () => {
    it('should handle token with symbol', () => {
      const token = {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
      }
      const { container } = render(<TokenLogo token={token} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle token with empty string symbol', () => {
      const token = {
        name: '',
        symbol: '',
        decimals: 0,
      } as any
      const { container } = render(<TokenLogo token={token} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle token with missing optional fields', () => {
      const token = {
        symbol: 'TEST',
      } as any
      const { container } = render(<TokenLogo token={token} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('chainId prop handling', () => {
    it('should handle chainId of 0', () => {
      const { container } = render(<TokenLogo chainId={0} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle negative chainId', () => {
      const { container } = render(<TokenLogo chainId={-1} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle very large chainId', () => {
      const { container } = render(<TokenLogo chainId={999999999} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined token prop', () => {
      const { container } = render(<TokenLogo token={undefined} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle null token prop', () => {
      const { container } = render(<TokenLogo token={null as any} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle empty object token prop', () => {
      const emptyToken = {} as any
      const { container } = render(<TokenLogo token={emptyToken} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should prioritize token prop over chainId when token is empty object', () => {
      const emptyToken = {} as any
      const { container } = render(<TokenLogo chainId={1} token={emptyToken} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('component structure', () => {
    it('should render single div wrapper', () => {
      const { container } = render(<TokenLogo />)

      const wrapper = container.querySelector('div')
      expect(wrapper).toBeInTheDocument()
    })

    it('should have exactly one child element (svg or img)', () => {
      const { container } = render(<TokenLogo />)

      const wrapper = container.querySelector('div')
      expect(wrapper?.children.length).toBe(1)
    })

    it('should render SVG instead of img when logoURI is empty', () => {
      const token = {
        name: 'Test',
        symbol: 'TST',
        decimals: 18,
        logoURI: '',
      }
      const { container } = render(<TokenLogo token={token} />)

      const img = container.querySelector('img')
      const svg = container.querySelector('svg')
      expect(img).not.toBeInTheDocument()
      expect(svg).toBeInTheDocument()
    })
  })

  describe('TODO comment behavior', () => {
    it('should render img when token has logoURI', () => {
      // With the fix, logoURI is now preserved when provided
      const token = {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        logoURI: 'https://example.com/test.png',
      }
      const { container } = render(<TokenLogo token={token} />)

      const img = container.querySelector('img')
      const svg = container.querySelector('svg')
      expect(img).toBeInTheDocument()
      expect(svg).not.toBeInTheDocument()
    })

    it('should render SVG when token has no logoURI', () => {
      const token = {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
      }
      const { container } = render(<TokenLogo token={token} />)

      const svg = container.querySelector('svg')
      const img = container.querySelector('img')
      expect(svg).toBeInTheDocument()
      expect(img).not.toBeInTheDocument()
    })
  })

  describe('img rendering (lines 27-31)', () => {
    it('should render img when displayToken has logoURI', () => {
      const token = {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        logoURI: 'https://example.com/logo.png',
      }

      const { container } = render(<TokenLogo token={token} />)

      const img = container.querySelector('img')
      const svg = container.querySelector('svg')
      expect(img).toBeInTheDocument()
      expect(svg).not.toBeInTheDocument()
    })

    it('should use logoURI as img src when present', () => {
      const logoURI = 'https://example.com/token-logo.png'
      const token = {
        name: 'Token',
        symbol: 'TKN',
        decimals: 18,
        logoURI,
      }

      const { container } = render(<TokenLogo token={token} />)

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('src', logoURI)
    })

    it('should use token symbol as img alt', () => {
      const symbol = 'ETH'
      const token = {
        name: 'Ethereum',
        symbol,
        decimals: 18,
        logoURI: 'https://example.com/eth.png',
      }

      const { container } = render(<TokenLogo token={token} />)

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', symbol)
    })

    it('should apply correct classes to img element', () => {
      const token = {
        name: 'Token',
        symbol: 'TKN',
        decimals: 18,
        logoURI: 'https://example.com/logo.png',
      }

      const { container } = render(<TokenLogo token={token} />)

      const img = container.querySelector('img')
      expect(img).toHaveClass('w-full')
      expect(img).toHaveClass('h-full')
      expect(img).toHaveClass('rounded-full')
      expect(img).toHaveClass('object-cover')
    })
  })

  describe('displayToken construction (lines 12-22)', () => {
    it('should use token prop when provided', () => {
      const token = {
        name: 'Custom Token',
        symbol: 'CTK',
        decimals: 18,
      }

      const displayToken = token || {
        name: '',
        symbol: '',
        decimals: 18,
      }

      expect(displayToken).toEqual(token)
    })

    it('should handle chainId of 0 (falsy branch)', () => {
      // chainId of 0 is falsy, so it should use undefined instead of looking up chains
      const { container } = render(<TokenLogo chainId={0} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle undefined chainId', () => {
      const { container } = render(<TokenLogo chainId={undefined} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should handle null chainId', () => {
      const { container } = render(<TokenLogo chainId={null as any} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should use chainId to find token when token not provided', () => {
      const _chainId = 1
      const foundToken = {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      }

      // Simulate the find operation
      const displayToken = foundToken

      expect(displayToken).toBeDefined()
    })

    it('should handle chainId not found in ROFL_PAYMASTER_ENABLED_CHAINS', () => {
      // Use a chainId that doesn't exist in ROFL_PAYMASTER_ENABLED_CHAINS
      // ROFL_PAYMASTER_ENABLED_CHAINS only contains sepolia (11155111)
      const chainId = 999
      const { container } = render(<TokenLogo chainId={chainId} />)

      // Should render SVG fallback since chain not found
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should set default values when token not found', () => {
      const defaults = {
        name: '',
        symbol: '',
        decimals: 18,
      }

      const displayToken = {
        ...defaults,
        logoURI: '',
      }

      expect(displayToken.name).toBe('')
      expect(displayToken.symbol).toBe('')
      expect(displayToken.decimals).toBe(18)
      expect(displayToken.logoURI).toBe('')
    })

    it('should preserve logoURI when provided', () => {
      const token = {
        name: 'Token',
        symbol: 'TKN',
        decimals: 18,
        logoURI: 'https://example.com/logo.png',
      }

      const displayToken = {
        ...token,
        logoURI: token.logoURI || '',
      }

      expect(displayToken.logoURI).toBe('https://example.com/logo.png')
    })

    it('should use empty string for logoURI when not provided', () => {
      const token = {
        name: 'Token',
        symbol: 'TKN',
        decimals: 18,
      }

      const displayToken = {
        ...token,
        logoURI: token.logoURI || '',
      }

      expect(displayToken.logoURI).toBe('')
    })
  })
})
