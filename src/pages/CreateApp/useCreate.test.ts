import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreate } from './useCreate'
import { useNetwork } from '../../hooks/useNetwork'

vi.mock('../../hooks/useNetwork', () => ({
  useNetwork: vi.fn(),
}))

describe('useCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result } = renderHook(() => useCreate())

    expect(result.current.currentStep).toBe(0)
    expect(result.current.appData.network).toBe('testnet')
    expect(result.current.appData.templateId).toBe('')
    expect(result.current.appData.metadata.name).toBe('')
    expect(result.current.appData.build.provider).toBe('')
    expect(result.current.appData.build.number).toBe(2)
    expect(result.current.appData.build.duration).toBe('hours')
  })

  it('should initialize with mainnet', () => {
    vi.mocked(useNetwork).mockReturnValue('mainnet')

    const { result } = renderHook(() => useCreate())

    expect(result.current.appData.network).toBe('mainnet')
  })

  it('should set current step', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result } = renderHook(() => useCreate())

    act(() => {
      result.current.setCurrentStep(2)
    })

    expect(result.current.currentStep).toBe(2)
  })

  it('should set app data form', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result } = renderHook(() => useCreate())

    act(() => {
      result.current.setAppDataForm({
        templateId: 'test-template',
        metadata: {
          name: 'Test App',
          author: 'Test Author',
          description: '',
          version: '',
          homepage: '',
        },
      })
    })

    expect(result.current.appData.templateId).toBe('test-template')
    expect(result.current.appData.metadata.name).toBe('Test App')
    expect(result.current.appData.metadata.author).toBe('Test Author')
  })

  it('should partially update app data', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result } = renderHook(() => useCreate())

    act(() => {
      result.current.setAppDataForm({
        templateId: 'template-1',
      })
    })

    expect(result.current.appData.templateId).toBe('template-1')

    act(() => {
      result.current.setAppDataForm({
        metadata: {
          name: 'App Name',
          author: '',
          description: '',
          version: '',
          homepage: '',
        },
      })
    })

    expect(result.current.appData.templateId).toBe('template-1')
    expect(result.current.appData.metadata.name).toBe('App Name')
  })

  it('should reset step and app data', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result } = renderHook(() => useCreate())

    act(() => {
      result.current.setCurrentStep(3)
      result.current.setAppDataForm({
        templateId: 'test-template',
      })
    })

    expect(result.current.currentStep).toBe(3)
    expect(result.current.appData.templateId).toBe('test-template')

    act(() => {
      result.current.resetStep()
    })

    expect(result.current.currentStep).toBe(0)
    expect(result.current.appData.templateId).toBe('')
    expect(result.current.appData.metadata.name).toBe('')
  })

  it('should handle network switch from testnet to mainnet', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result, rerender } = renderHook(() => useCreate())

    act(() => {
      result.current.setCurrentStep(5)
      result.current.setAppDataForm({
        templateId: 'test-template',
        metadata: {
          name: 'Test App',
          author: 'Test Author',
          description: '',
          version: '',
          homepage: '',
        },
        build: {
          provider: 'test-provider',
          duration: 'days',
          number: 5,
          offerId: 'offer-123',
          offerCpus: 4,
          offerMemory: 8,
          offerStorage: 100,
        },
      })
    })

    expect(result.current.currentStep).toBe(5)
    expect(result.current.appData.network).toBe('testnet')

    // Simulate network change
    vi.mocked(useNetwork).mockReturnValue('mainnet')

    rerender()

    // Step should be reset to 3 if it was > 3
    expect(result.current.currentStep).toBe(3)
    expect(result.current.appData.network).toBe('mainnet')
    // Template and metadata should be preserved
    expect(result.current.appData.templateId).toBe('test-template')
    expect(result.current.appData.metadata.name).toBe('Test App')
    // Build should be reset
    expect(result.current.appData.build.provider).toBe('')
    expect(result.current.appData.build.offerId).toBe('')
  })

  it('should handle network switch from mainnet to testnet', () => {
    vi.mocked(useNetwork).mockReturnValue('mainnet')

    const { result, rerender } = renderHook(() => useCreate())

    act(() => {
      result.current.setAppDataForm({
        templateId: 'mainnet-template',
        build: {
          provider: 'mainnet-provider',
          duration: 'hours',
          number: 10,
          offerId: 'mainnet-offer',
          offerCpus: 8,
          offerMemory: 16,
          offerStorage: 200,
        },
      })
    })

    // Simulate network change
    vi.mocked(useNetwork).mockReturnValue('testnet')

    rerender()

    expect(result.current.appData.network).toBe('testnet')
    expect(result.current.appData.templateId).toBe('mainnet-template')
    expect(result.current.appData.build.provider).toBe('')
  })

  it('should not reset step if step is <= 3 on network switch', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result, rerender } = renderHook(() => useCreate())

    act(() => {
      result.current.setCurrentStep(2)
    })

    vi.mocked(useNetwork).mockReturnValue('mainnet')

    rerender()

    expect(result.current.currentStep).toBe(2)
  })

  it('should update build configuration', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result } = renderHook(() => useCreate())

    act(() => {
      result.current.setAppDataForm({
        build: {
          provider: 'provider-1',
          duration: 'days',
          number: 7,
          offerId: 'offer-abc',
          offerCpus: 2,
          offerMemory: 4,
          offerStorage: 50,
        },
      })
    })

    expect(result.current.appData.build.provider).toBe('provider-1')
    expect(result.current.appData.build.duration).toBe('days')
    expect(result.current.appData.build.number).toBe(7)
    expect(result.current.appData.build.offerId).toBe('offer-abc')
    expect(result.current.appData.build.offerCpus).toBe(2)
    expect(result.current.appData.build.offerMemory).toBe(4)
    expect(result.current.appData.build.offerStorage).toBe(50)
  })

  it('should set all metadata fields', () => {
    vi.mocked(useNetwork).mockReturnValue('testnet')

    const { result } = renderHook(() => useCreate())

    act(() => {
      result.current.setAppDataForm({
        metadata: {
          name: 'My App',
          author: 'Developer',
          description: 'A great application',
          version: '1.0.0',
          homepage: 'https://example.com',
        },
      })
    })

    expect(result.current.appData.metadata.name).toBe('My App')
    expect(result.current.appData.metadata.author).toBe('Developer')
    expect(result.current.appData.metadata.description).toBe('A great application')
    expect(result.current.appData.metadata.version).toBe('1.0.0')
    expect(result.current.appData.metadata.homepage).toBe('https://example.com')
  })

  describe('Network Switch Behavior', () => {
    it('should reset build provider and offerId on network switch', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result, rerender } = renderHook(() => useCreate())

      act(() => {
        result.current.setAppDataForm({
          build: {
            provider: 'test-provider',
            duration: 'hours',
            number: 5,
            offerId: 'offer-123',
            offerCpus: 2,
            offerMemory: 4,
            offerStorage: 10,
          },
        })
      })

      expect(result.current.appData.build.provider).toBe('test-provider')
      expect(result.current.appData.build.offerId).toBe('offer-123')

      // Switch to mainnet
      vi.mocked(useNetwork).mockReturnValue('mainnet')
      rerender()

      // Build should be reset
      expect(result.current.appData.build.provider).toBe('')
      expect(result.current.appData.build.offerId).toBe('')
      expect(result.current.appData.network).toBe('mainnet')
    })

    it('should preserve templateId and metadata on network switch', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result, rerender } = renderHook(() => useCreate())

      act(() => {
        result.current.setAppDataForm({
          templateId: 'my-template',
          metadata: {
            name: 'My App',
            author: 'test@example.com',
            description: 'Test',
            version: '1.0.0',
            homepage: 'https://example.com',
          },
        })
      })

      // Switch network
      vi.mocked(useNetwork).mockReturnValue('mainnet')
      rerender()

      // Template and metadata should be preserved
      expect(result.current.appData.templateId).toBe('my-template')
      expect(result.current.appData.metadata.name).toBe('My App')
      expect(result.current.appData.network).toBe('mainnet')
    })

    it('should preserve inputs on network switch', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result, rerender } = renderHook(() => useCreate())

      act(() => {
        result.current.setAppDataForm({
          inputs: {
            compose: 'version: "3.8"',
            secrets: { KEY: 'value' },
          },
        })
      })

      // Switch network
      vi.mocked(useNetwork).mockReturnValue('mainnet')
      rerender()

      // Inputs should be preserved
      expect(result.current.appData.inputs).toBeDefined()
    })

    it('should not change step if currentStep <= 3 on network switch', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result, rerender } = renderHook(() => useCreate())

      act(() => {
        result.current.setCurrentStep(2)
      })

      expect(result.current.currentStep).toBe(2)

      // Switch network
      vi.mocked(useNetwork).mockReturnValue('mainnet')
      rerender()

      // Step should remain 2
      expect(result.current.currentStep).toBe(2)
    })
  })

  describe('Build Configuration Edge Cases', () => {
    it('should handle zero values in build config', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result } = renderHook(() => useCreate())

      act(() => {
        result.current.setAppDataForm({
          build: {
            provider: 'zero-provider',
            duration: 'hours',
            number: 0,
            offerId: 'zero-offer',
            offerCpus: 0,
            offerMemory: 0,
            offerStorage: 0,
          },
        })
      })

      expect(result.current.appData.build.number).toBe(0)
      expect(result.current.appData.build.offerCpus).toBe(0)
      expect(result.current.appData.build.offerMemory).toBe(0)
      expect(result.current.appData.build.offerStorage).toBe(0)
    })

    it('should handle large values in build config', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result } = renderHook(() => useCreate())

      act(() => {
        result.current.setAppDataForm({
          build: {
            provider: 'large-provider',
            duration: 'months',
            number: 12,
            offerId: 'large-offer',
            offerCpus: 64,
            offerMemory: 256000,
            offerStorage: 10000,
          },
        })
      })

      expect(result.current.appData.build.number).toBe(12)
      expect(result.current.appData.build.offerCpus).toBe(64)
      expect(result.current.appData.build.offerMemory).toBe(256000)
      expect(result.current.appData.build.offerStorage).toBe(10000)
    })
  })

  describe('AppData Initialization', () => {
    it('should initialize with empty templateId', () => {
      vi.mocked(useNetwork).mockReturnValue('mainnet')

      const { result } = renderHook(() => useCreate())

      expect(result.current.appData.templateId).toBe('')
    })

    it('should initialize with empty metadata fields', () => {
      vi.mocked(useNetwork).mockReturnValue('mainnet')

      const { result } = renderHook(() => useCreate())

      expect(result.current.appData.metadata.name).toBe('')
      expect(result.current.appData.metadata.author).toBe('')
      expect(result.current.appData.metadata.description).toBe('')
      expect(result.current.appData.metadata.version).toBe('')
      expect(result.current.appData.metadata.homepage).toBe('')
    })

    it('should initialize with default build values', () => {
      vi.mocked(useNetwork).mockReturnValue('mainnet')

      const { result } = renderHook(() => useCreate())

      expect(result.current.appData.build.provider).toBe('')
      expect(result.current.appData.build.duration).toBe('hours')
      expect(result.current.appData.build.number).toBe(2)
      expect(result.current.appData.build.offerId).toBe('')
      expect(result.current.appData.build.offerCpus).toBe(0)
      expect(result.current.appData.build.offerMemory).toBe(0)
      expect(result.current.appData.build.offerStorage).toBe(0)
    })
  })

  describe('Step Management', () => {
    it('should set step to any valid value', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result } = renderHook(() => useCreate())

      const steps = [0, 1, 2, 3, 4, 5]

      steps.forEach(step => {
        act(() => {
          result.current.setCurrentStep(step)
        })
        expect(result.current.currentStep).toBe(step)
      })
    })

    it('should handle resetting from any step', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result } = renderHook(() => useCreate())

      // Test reset from each step
      for (let initialStep = 0; initialStep <= 5; initialStep++) {
        act(() => {
          result.current.setCurrentStep(initialStep)
          result.current.setAppDataForm({
            templateId: `template-${initialStep}`,
          })
        })

        expect(result.current.currentStep).toBe(initialStep)
        expect(result.current.appData.templateId).toBe(`template-${initialStep}`)

        act(() => {
          result.current.resetStep()
        })

        expect(result.current.currentStep).toBe(0)
        expect(result.current.appData.templateId).toBe('')
      }
    })
  })

  describe('Partial Data Updates', () => {
    it('should handle updating metadata separately', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result } = renderHook(() => useCreate())

      act(() => {
        result.current.setAppDataForm({
          metadata: {
            name: 'App Name',
            author: '',
            description: '',
            version: '',
            homepage: '',
          },
        })
      })

      act(() => {
        result.current.setAppDataForm({
          metadata: {
            name: 'App Name',
            author: 'author@example.com',
            description: '',
            version: '',
            homepage: '',
          },
        })
      })

      expect(result.current.appData.metadata.name).toBe('App Name')
      expect(result.current.appData.metadata.author).toBe('author@example.com')
    })

    it('should handle updating build separately from metadata', () => {
      vi.mocked(useNetwork).mockReturnValue('testnet')

      const { result } = renderHook(() => useCreate())

      act(() => {
        result.current.setAppDataForm({
          metadata: {
            name: 'Test',
            author: '',
            description: '',
            version: '',
            homepage: '',
          },
        })
      })

      act(() => {
        result.current.setAppDataForm({
          build: {
            provider: 'provider-1',
            duration: 'hours',
            number: 5,
            offerId: 'offer-1',
            offerCpus: 2,
            offerMemory: 4,
            offerStorage: 10,
          },
        })
      })

      expect(result.current.appData.metadata.name).toBe('Test')
      expect(result.current.appData.build.provider).toBe('provider-1')
    })
  })
})
