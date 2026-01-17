import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MachineName } from './index'

// Mock WHITELISTED_PROVIDER_ADDRESSES before importing
vi.mock('../../utils/providers', () => ({
  WHITELISTED_PROVIDER_ADDRESSES: {
    mainnet: 'oasis1qzl8am6tmv3n0d3s9qxqy8z7x9x2l3m4n5o6p7q8r',
    testnet: 'oasis1qxl9bn7unu2e4f0r8py0z8y0x3y4z5a6b7c8d9e0f',
  },
}))

const mockMachine = {
  id: 'abc123def456',
  provider: 'oasis1qzl8am6tmv3n0d3s9qxqy8z7x9x2l3m4n5o6p7q8r',
  metadata: {
    'net.oasis.provider.name': 'Test Provider',
  },
} as any

describe('MachineName', () => {
  it('renders OPF name for mainnet OPF provider', () => {
    const { container } = render(<MachineName machine={mockMachine} network="mainnet" />)

    // Text is split across fragments, so we check container text content
    expect(container.textContent).toContain('OPF')
    expect(container.textContent).toContain('-')
    expect(container.textContent).toContain('ef456')
  })

  it('renders OPF Testnet name for testnet OPF provider', () => {
    const testnetMachine = {
      ...mockMachine,
      provider: 'oasis1qxl9bn7unu2e4f0r8py0z8y0x3y4z5a6b7c8d9e0f',
    }

    const { container } = render(<MachineName machine={testnetMachine} network="testnet" />)

    expect(container.textContent).toContain('OPF Testnet')
  })

  it('renders provider name from metadata for non-OPF provider', () => {
    const nonOpfMachine = {
      ...mockMachine,
      provider: 'oasis1q999999999999999999999999999999999999999',
    }

    const { container } = render(<MachineName machine={nonOpfMachine} network="mainnet" />)

    expect(container.textContent).toContain('Test Provider')
    expect(container.textContent).toContain('-')
    expect(container.textContent).toContain('def456')
  })

  it('renders trimmed provider address when no metadata name', () => {
    const machineWithoutMetadata = {
      id: 'xyz789uvw012',
      provider: 'oasis1q1234567890abcdefghijklmnopqrstuvwxy',
      metadata: {},
    } as any

    const { container } = render(<MachineName machine={machineWithoutMetadata} network="mainnet" />)

    // Should show trimmed address (oasis1q...vwxy)
    expect(container.textContent).toMatch(/oasis1/)
    expect(container.textContent).toContain('-')
    expect(container.textContent).toContain('w012')
  })

  it('always includes machine ID suffix', () => {
    const { container } = render(<MachineName machine={mockMachine} network="mainnet" />)

    expect(container.textContent).toContain('-')
    expect(container.textContent).toContain('ef456')
  })
})
