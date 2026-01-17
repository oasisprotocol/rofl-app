import { describe, it, expect } from 'vitest'
import type { Address } from 'viem'
import {
  ROFL_PAYMASTER_ENABLED_CHAINS,
  ROFL_PAYMASTER_ENABLED_CHAINS_IDS,
  ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS,
  ROFL_PAYMASTER_EXPECTED_TIME,
  ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT,
  ROFL_PAYMASTER_DESTINATION_CHAIN,
  ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN,
  ROFL_PAYMASTER_TOKEN_CONFIG,
  ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG,
} from './rofl-paymaster-config'
import { sepolia, sapphireTestnet, sapphire } from 'viem/chains'

describe('rofl-paymaster-config constants', () => {
  describe('module exports', () => {
    it('should export ROFL_PAYMASTER_ENABLED_CHAINS', () => {
      expect(ROFL_PAYMASTER_ENABLED_CHAINS).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_ENABLED_CHAINS_IDS', () => {
      expect(ROFL_PAYMASTER_ENABLED_CHAINS_IDS).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS', () => {
      expect(ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_EXPECTED_TIME', () => {
      expect(ROFL_PAYMASTER_EXPECTED_TIME).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT', () => {
      expect(ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_DESTINATION_CHAIN', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_TOKEN_CONFIG', () => {
      expect(ROFL_PAYMASTER_TOKEN_CONFIG).toBeDefined()
    })

    it('should export ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG', () => {
      expect(ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG).toBeDefined()
    })
  })

  describe('ROFL_PAYMASTER_ENABLED_CHAINS', () => {
    it('should be an array', () => {
      expect(Array.isArray(ROFL_PAYMASTER_ENABLED_CHAINS)).toBe(true)
    })

    it('should include sepolia chain', () => {
      expect(ROFL_PAYMASTER_ENABLED_CHAINS.some(c => c.id === sepolia.id)).toBe(true)
    })

    it('should have at least one chain', () => {
      expect(ROFL_PAYMASTER_ENABLED_CHAINS.length).toBeGreaterThan(0)
    })

    it('should contain chain objects with required properties', () => {
      ROFL_PAYMASTER_ENABLED_CHAINS.forEach(chain => {
        expect(chain).toHaveProperty('id')
        expect(chain).toHaveProperty('name')
        expect(chain).toHaveProperty('nativeCurrency')
      })
    })
  })

  describe('ROFL_PAYMASTER_ENABLED_CHAINS_IDS', () => {
    it('should be an array of chain ID strings', () => {
      expect(Array.isArray(ROFL_PAYMASTER_ENABLED_CHAINS_IDS)).toBe(true)
      ROFL_PAYMASTER_ENABLED_CHAINS_IDS.forEach(id => {
        expect(typeof id).toBe('string')
      })
    })

    it('should have same length as enabled chains', () => {
      expect(ROFL_PAYMASTER_ENABLED_CHAINS_IDS.length).toBe(ROFL_PAYMASTER_ENABLED_CHAINS.length)
    })

    it('should contain sepolia chain ID', () => {
      expect(ROFL_PAYMASTER_ENABLED_CHAINS_IDS).toContain(sepolia.id.toString())
    })

    it('should correspond to chain IDs from enabled chains', () => {
      ROFL_PAYMASTER_ENABLED_CHAINS.forEach(chain => {
        expect(ROFL_PAYMASTER_ENABLED_CHAINS_IDS).toContain(chain.id.toString())
      })
    })

    it('should not contain duplicate IDs', () => {
      const uniqueIds = new Set(ROFL_PAYMASTER_ENABLED_CHAINS_IDS)
      expect(uniqueIds.size).toBe(ROFL_PAYMASTER_ENABLED_CHAINS_IDS.length)
    })
  })

  describe('ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS', () => {
    it('should be 0xNATIVE', () => {
      expect(ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS).toBe('0xNATIVE')
    })

    it('should start with 0x', () => {
      expect(ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS).toMatch(/^0x/)
    })

    it('should be a string', () => {
      expect(typeof ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS).toBe('string')
    })

    it('should have valid length for special address', () => {
      expect(ROFL_PAYMASTER_NATIVE_TOKEN_ADDRESS.length).toBeGreaterThan(0)
    })
  })

  describe('ROFL_PAYMASTER_EXPECTED_TIME', () => {
    it('should be 30 seconds', () => {
      expect(ROFL_PAYMASTER_EXPECTED_TIME).toBe(30)
    })

    it('should be a number', () => {
      expect(typeof ROFL_PAYMASTER_EXPECTED_TIME).toBe('number')
    })

    it('should be positive', () => {
      expect(ROFL_PAYMASTER_EXPECTED_TIME).toBeGreaterThan(0)
    })
  })

  describe('ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT', () => {
    it('should be 500000', () => {
      expect(ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT).toBe(500_000n)
    })

    it('should be a bigint', () => {
      expect(typeof ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT).toBe('bigint')
    })

    it('should be positive', () => {
      expect(ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT).toBeGreaterThan(0n)
    })

    it('should be reasonable gas limit', () => {
      expect(ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT).toBeLessThanOrEqual(10_000_000n)
    })
  })

  describe('ROFL_PAYMASTER_DESTINATION_CHAIN', () => {
    it('should be sapphireTestnet', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN.id).toBe(sapphireTestnet.id)
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN.name).toBe(sapphireTestnet.name)
    })

    it('should have required chain properties', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN).toHaveProperty('id')
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN).toHaveProperty('name')
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN).toHaveProperty('nativeCurrency')
    })

    it('should have testnet ID', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN.id).toBe(sapphireTestnet.id)
    })
  })

  describe('ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN', () => {
    it('should have token properties', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN).toHaveProperty('name')
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN).toHaveProperty('symbol')
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN).toHaveProperty('decimals')
    })

    it('should have TEST symbol (testnet)', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.symbol).toBe('TEST')
    })

    it('should have valid decimals', () => {
      expect(typeof ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.decimals).toBe('number')
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.decimals).toBeGreaterThan(0)
    })

    it('should match destination chain native currency', () => {
      expect(ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN).toBe(ROFL_PAYMASTER_DESTINATION_CHAIN.nativeCurrency)
    })
  })

  describe('ROFL_PAYMASTER_TOKEN_CONFIG', () => {
    it('should have config for sepolia chain', () => {
      expect(ROFL_PAYMASTER_TOKEN_CONFIG).toHaveProperty(sepolia.id.toString())
    })

    it('should have paymaster contract address', () => {
      const config = ROFL_PAYMASTER_TOKEN_CONFIG[sepolia.id.toString()]
      expect(config).toHaveProperty('paymasterContractAddress')
      expect(config.paymasterContractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should have tokens array', () => {
      const config = ROFL_PAYMASTER_TOKEN_CONFIG[sepolia.id.toString()]
      expect(Array.isArray(config.TOKENS)).toBe(true)
    })

    it('should have USDT token in sepolia config', () => {
      const config = ROFL_PAYMASTER_TOKEN_CONFIG[sepolia.id.toString()]
      const usdt = config.TOKENS.find(t => t.symbol === 'USDT')
      expect(usdt).toBeDefined()
      expect(usdt?.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(usdt?.decimals).toBe(6)
      expect(usdt?.name).toBe('Tether USD')
    })

    it('should have token properties', () => {
      const config = ROFL_PAYMASTER_TOKEN_CONFIG[sepolia.id.toString()]
      config.TOKENS.forEach(token => {
        expect(token).toHaveProperty('contractAddress')
        expect(token).toHaveProperty('symbol')
        expect(token).toHaveProperty('decimals')
        expect(token).toHaveProperty('name')
        expect(typeof token.decimals).toBe('number')
        expect(token.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
      })
    })

    it('should have correct type structure', () => {
      const config = ROFL_PAYMASTER_TOKEN_CONFIG[sepolia.id.toString()]
      const paymasterAddress: Address = config.paymasterContractAddress
      expect(paymasterAddress).toBeDefined()
    })
  })

  describe('ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG', () => {
    it('should have config for sapphire testnet', () => {
      expect(ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG).toHaveProperty(sapphireTestnet.id.toString())
    })

    it('should have config for sapphire mainnet', () => {
      expect(ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG).toHaveProperty(sapphire.id.toString())
    })

    it('should have valid contract address for testnet', () => {
      const address = ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG[sapphireTestnet.id.toString()]
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should have zero address for mainnet (TODO)', () => {
      const address = ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG[sapphire.id.toString()]
      expect(address).toBe('0x0000000000000000000000000000000000000000')
    })

    it('should have valid address format for all entries', () => {
      Object.values(ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG).forEach(address => {
        expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      })
    })

    it('should have Address type for all entries', () => {
      Object.values(ROFL_PAYMASTER_SAPPHIRE_CONTRACT_CONFIG).forEach(address => {
        const typedAddress: Address = address
        expect(typedAddress).toBeDefined()
      })
    })
  })

  describe('config consistency', () => {
    it('should have consistent chain IDs across configs', () => {
      const tokenConfigChainIds = Object.keys(ROFL_PAYMASTER_TOKEN_CONFIG)
      const enabledChainIds = ROFL_PAYMASTER_ENABLED_CHAINS_IDS

      tokenConfigChainIds.forEach(chainId => {
        expect(enabledChainIds).toContain(chainId)
      })
    })

    it('should have all chains in token config', () => {
      ROFL_PAYMASTER_ENABLED_CHAINS_IDS.forEach(chainId => {
        expect(ROFL_PAYMASTER_TOKEN_CONFIG).toHaveProperty(chainId)
      })
    })
  })
})
