import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { MachineName } from './index'
import type { RoflMarketInstance } from '../../nexus/api'

// Mock the utility functions
vi.mock('../../utils/providers', () => ({
  WHITELISTED_PROVIDER_ADDRESSES: {
    mainnet: 'oasis1qzc8pldvm8vm3duvdrj63wgvkw34y9ucfcxzetqr',
    testnet: 'oasis1qp2ens0hsp7gh23wajxa4hpetkdek3swyyulyrmz',
  },
}))

vi.mock('../../utils/trimLongString', () => ({
  trimLongString: vi.fn((value: string) => `${value.slice(0, 6)}…${value.slice(-6)}`),
}))

import { WHITELISTED_PROVIDER_ADDRESSES } from '../../utils/providers'
import { trimLongString } from '../../utils/trimLongString'

const mockTrimLongString = vi.mocked(trimLongString)

describe('MachineName', () => {
  const createMockMachine = (overrides: Partial<RoflMarketInstance> = {}): RoflMarketInstance => ({
    id: 'machine-id-abcdef123456',
    provider: 'oasis1providerabcdefghijklmnopqrstuvwxyz',
    offer_id: 'offer-123',
    status: 1,
    creator: 'oasis1creator',
    admin: 'oasis1admin',
    metadata: {},
    resources: {},
    deployment: {},
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('component rendering', () => {
    it('should render without crashing', () => {
      const machine = createMockMachine()
      const { container } = render(<MachineName machine={machine} network="mainnet" />)
      expect(container.textContent).toBeTruthy()
    })

    it('should be defined', () => {
      expect(MachineName).toBeDefined()
    })

    it('should render machine name with ID suffix', () => {
      const machine = createMockMachine({ id: 'machine-id-abcdef123456' })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('123456')
    })
  })

  describe('OPF provider on mainnet', () => {
    it('should display "OPF" for whitelisted mainnet provider', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
        id: 'machine-abc123',
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('OPF')
    })

    it('should append machine ID suffix to OPF', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
        id: 'machine-id-abcdef123456',
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('OPF')
      expect(container.textContent).toContain('123456')
    })

    it('should ignore metadata when provider is OPF', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'Custom Name Should Not Show',
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('OPF')
      expect(container.textContent).not.toContain('Custom Name Should Not Show')
    })
  })

  describe('OPF provider on testnet', () => {
    it('should display "OPF Testnet" for whitelisted testnet provider', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.testnet,
        id: 'machine-abc123',
      })
      const { container } = render(<MachineName machine={machine} network="testnet" />)

      expect(container.textContent).toContain('OPF Testnet')
    })

    it('should append machine ID suffix to OPF Testnet', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.testnet,
        id: 'machine-id-abcdef123456',
      })
      const { container } = render(<MachineName machine={machine} network="testnet" />)

      expect(container.textContent).toContain('OPF Testnet')
      expect(container.textContent).toContain('123456')
    })

    it('should ignore metadata when provider is OPF on testnet', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.testnet,
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'Custom Name Should Not Show',
        },
      })
      const { container } = render(<MachineName machine={machine} network="testnet" />)

      expect(container.textContent).toContain('OPF Testnet')
      expect(container.textContent).not.toContain('Custom Name Should Not Show')
    })
  })

  describe('non-OPF providers', () => {
    it('should display provider name from metadata when available', () => {
      const providerAddress = 'oasis1nonopfprovider'
      const machine = createMockMachine({
        provider: providerAddress,
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'My Custom Provider',
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('My Custom Provider')
      expect(container.textContent).toContain('abc123')
      expect(mockTrimLongString).not.toHaveBeenCalled()
    })

    it('should use trimLongString when metadata name is not available', () => {
      const providerAddress = 'oasis1nonopfproviderabcdefghijklmnopqrstuvwxyz'
      const machine = createMockMachine({
        provider: providerAddress,
        id: 'machine-abc123',
        metadata: {},
      })
      render(<MachineName machine={machine} network="mainnet" />)

      expect(mockTrimLongString).toHaveBeenCalledWith(providerAddress)
    })

    it('should append machine ID to trimmed provider address', () => {
      const providerAddress = 'oasis1nonopfprovider'
      const machine = createMockMachine({
        provider: providerAddress,
        id: 'machine-abcdef123456',
        metadata: {},
      })
      mockTrimLongString.mockReturnValue('oasis1…ider')

      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('oasis1…ider')
      expect(container.textContent).toContain('123456')
    })

    it('should handle provider that is not whitelisted', () => {
      const machine = createMockMachine({
        provider: 'oasis1randomprovider',
        id: 'machine-abc123',
        metadata: {},
      })
      render(<MachineName machine={machine} network="mainnet" />)

      expect(mockTrimLongString).toHaveBeenCalledWith('oasis1randomprovider')
    })
  })

  describe('machine ID suffix', () => {
    it('should always append last 6 characters of machine ID', () => {
      const machine = createMockMachine({
        id: 'machine-id-xyz789',
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('xyz789')
    })

    it('should handle short machine IDs', () => {
      const machine = createMockMachine({
        id: 'abc',
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('OPF')
      expect(container.textContent).toContain('abc')
    })

    it('should handle long machine IDs', () => {
      const machine = createMockMachine({
        id: 'very-long-machine-id-with-many-characters-123456789',
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('6789')
    })

    it('should handle machine ID with special characters', () => {
      const machine = createMockMachine({
        id: 'machine-id_123!@#',
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('3!@#')
    })
  })

  describe('metadata handling', () => {
    it('should use metadata provider name for non-OPF provider', () => {
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'Awesome Provider Inc.',
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('Awesome Provider Inc.')
      expect(container.textContent).toContain('abc123')
    })

    it('should handle empty metadata object', () => {
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: {},
      })
      render(<MachineName machine={machine} network="mainnet" />)

      expect(mockTrimLongString).toHaveBeenCalledWith('oasis1custom')
    })

    it('should handle undefined metadata', () => {
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: undefined,
      })
      render(<MachineName machine={machine} network="mainnet" />)

      expect(mockTrimLongString).toHaveBeenCalledWith('oasis1custom')
    })

    it('should handle metadata without provider name key', () => {
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: {
          'other.key': 'some value',
        },
      })
      render(<MachineName machine={machine} network="mainnet" />)

      expect(mockTrimLongString).toHaveBeenCalledWith('oasis1custom')
    })
  })

  describe('network parameter', () => {
    it('should handle mainnet network parameter', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
        id: 'machine-abc123',
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('OPF')
      expect(container.textContent).toContain('abc123')
    })

    it('should handle testnet network parameter', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.testnet,
        id: 'machine-abc123',
      })
      const { container } = render(<MachineName machine={machine} network="testnet" />)

      expect(container.textContent).toContain('OPF Testnet')
      expect(container.textContent).toContain('abc123')
    })

    it('should differentiate between mainnet and testnet OPF providers', () => {
      const mainnetMachine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
        id: 'machine-abc123',
      })
      const testnetMachine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.testnet,
        id: 'machine-abc123',
      })

      const { container, rerender } = render(<MachineName machine={mainnetMachine} network="mainnet" />)
      expect(container.textContent).toContain('OPF')

      rerender(<MachineName machine={testnetMachine} network="testnet" />)
      expect(container.textContent).toContain('OPF Testnet')
    })
  })

  describe('edge cases', () => {
    it('should handle very long provider names in metadata', () => {
      const longName = 'A'.repeat(100)
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': longName,
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain(longName)
      expect(container.textContent).toContain('abc123')
    })

    it('should handle special characters in metadata provider name', () => {
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'Provider & Co. (Ltd)',
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('Provider & Co. (Ltd)')
      expect(container.textContent).toContain('abc123')
    })

    it('should handle unicode characters in metadata provider name', () => {
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'プロバイダー',
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('プロバイダー')
      expect(container.textContent).toContain('abc123')
    })

    it('should handle provider address with special characters', () => {
      const machine = createMockMachine({
        provider: 'oasis1provider.with.special.chars',
        id: 'machine-abc123',
        metadata: {},
      })
      render(<MachineName machine={machine} network="mainnet" />)

      expect(mockTrimLongString).toHaveBeenCalledWith('oasis1provider.with.special.chars')
    })
  })

  describe('conditional rendering', () => {
    it('should not show provider name when provider is OPF mainnet', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.mainnet,
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'Should Not Show',
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).not.toContain('Should Not Show')
      expect(container.textContent).toContain('OPF')
    })

    it('should not show provider name when provider is OPF testnet', () => {
      const machine = createMockMachine({
        provider: WHITELISTED_PROVIDER_ADDRESSES.testnet,
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'Should Not Show',
        },
      })
      const { container } = render(<MachineName machine={machine} network="testnet" />)

      expect(container.textContent).not.toContain('Should Not Show')
      expect(container.textContent).toContain('OPF Testnet')
    })

    it('should show provider name from metadata for non-OPF', () => {
      const machine = createMockMachine({
        provider: 'oasis1custom',
        id: 'machine-abc123',
        metadata: {
          'net.oasis.provider.name': 'Custom Provider',
        },
      })
      const { container } = render(<MachineName machine={machine} network="mainnet" />)

      expect(container.textContent).toContain('Custom Provider')
    })
  })
})
