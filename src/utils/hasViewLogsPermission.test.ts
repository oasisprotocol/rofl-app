import { describe, it, expect, vi } from 'vitest'
import { hasViewLogsPermission } from './hasViewLogsPermission'

// Mock nexus/api to avoid loading the real implementation which imports axios
vi.mock('../nexus/api', () => ({
  RoflMarketInstance: {},
  List: {},
}))

// Mock the oasis library
vi.mock('@oasisprotocol/client', async () => {
  const actual = await vi.importActual('@oasisprotocol/client')
  return {
    ...actual,
    misc: {
      fromCBOR: vi.fn(),
      fromBase64: vi.fn(),
    },
    staking: {
      addressToBech32: vi.fn(),
    },
  }
})

import * as oasis from '@oasisprotocol/client'

// Mock helpers
vi.mock('./helpers', () => ({
  getEvmBech32Address: vi.fn((address: string) => `oasis_${address}`),
}))

import { getEvmBech32Address } from './helpers'

describe('hasViewLogsPermission', () => {
  const mockEvmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as const

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false when machine has no deployment', () => {
    const machine = {} as any
    expect(hasViewLogsPermission(machine, mockEvmAddress)).toBe(false)
  })

  it('should return false when deployment has no metadata', () => {
    const machine = { deployment: {} } as any
    expect(hasViewLogsPermission(machine, mockEvmAddress)).toBe(false)
  })

  it('should return false when metadata has no permissions', () => {
    const machine = { deployment: { metadata: {} } } as any
    expect(hasViewLogsPermission(machine, mockEvmAddress)).toBe(false)
  })

  it('should return false when permissions metadata is missing', () => {
    const machine = {
      deployment: { metadata: { 'other.key': 'value' } },
    } as any
    expect(hasViewLogsPermission(machine, mockEvmAddress)).toBe(false)
  })

  it('should decode CBOR permissions and check for log.view access', () => {
    // Mock the CBOR decoding to return permissions with log.view
    const mockAddressBytes = new Uint8Array([1, 2, 3])
    const mockPermissions = {
      'log.view': [mockAddressBytes],
    }
    vi.mocked(oasis.misc.fromCBOR).mockReturnValue(mockPermissions)
    vi.mocked(oasis.misc.fromBase64).mockReturnValue(new Uint8Array([1, 2, 3]))

    // Mock address comparison to return the same address (matching)
    vi.mocked(getEvmBech32Address).mockReturnValue('oasis_0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
    vi.mocked(oasis.staking.addressToBech32).mockReturnValue(
      'oasis_0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    )

    const machine = {
      deployment: {
        metadata: {
          'net.oasis.scheduler.permissions': 'base64encodedvalue',
        },
      },
    } as any

    const result = hasViewLogsPermission(machine, mockEvmAddress)
    expect(oasis.misc.fromBase64).toHaveBeenCalledWith('base64encodedvalue')
    expect(oasis.misc.fromCBOR).toHaveBeenCalled()
    expect(result).toBe(mockAddressBytes)
  })

  it('should return falsy when log.view array does not contain the address', () => {
    const mockPermissions = {
      'log.view': [new Uint8Array([4, 5, 6])],
    }
    vi.mocked(oasis.misc.fromCBOR).mockReturnValue(mockPermissions)
    vi.mocked(oasis.misc.fromBase64).mockReturnValue(new Uint8Array([1, 2, 3]))

    // Mock address comparison to return different address
    vi.mocked(getEvmBech32Address).mockReturnValue('oasis_0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
    vi.mocked(oasis.staking.addressToBech32).mockReturnValue('oasis_differentaddress')

    const machine = {
      deployment: {
        metadata: {
          'net.oasis.scheduler.permissions': 'base64encodedvalue',
        },
      },
    } as any

    expect(hasViewLogsPermission(machine, mockEvmAddress)).toBeFalsy()
  })

  it('should return falsy when log.view array is empty', () => {
    const mockPermissions = {
      'log.view': [],
    }
    vi.mocked(oasis.misc.fromCBOR).mockReturnValue(mockPermissions)
    vi.mocked(oasis.misc.fromBase64).mockReturnValue(new Uint8Array([]))

    vi.mocked(getEvmBech32Address).mockReturnValue('oasis_0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')

    const machine = {
      deployment: {
        metadata: {
          'net.oasis.scheduler.permissions': 'base64encodedvalue',
        },
      },
    } as any

    expect(hasViewLogsPermission(machine, mockEvmAddress)).toBeFalsy()
  })

  it('should return falsy when log.view is not in permissions', () => {
    const mockPermissions = {
      'other.permission': [new Uint8Array([1, 2, 3])],
    }
    vi.mocked(oasis.misc.fromCBOR).mockReturnValue(mockPermissions)
    vi.mocked(oasis.misc.fromBase64).mockReturnValue(new Uint8Array([1, 2, 3]))

    vi.mocked(getEvmBech32Address).mockReturnValue('oasis_0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')

    const machine = {
      deployment: {
        metadata: {
          'net.oasis.scheduler.permissions': 'base64encodedvalue',
        },
      },
    } as any

    expect(hasViewLogsPermission(machine, mockEvmAddress)).toBeFalsy()
  })
})
