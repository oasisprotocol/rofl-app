import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BuildStepOffers } from './BuildStepOffers'
import type { RoflMarketOffer } from '../../nexus/api'
import * as oasisRT from '@oasisprotocol/client-rt'

// Mock the UI library components
vi.mock('@oasisprotocol/ui-library/src/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) =>
    React.createElement('label', { htmlFor, className, 'data-testid': 'label' }, children),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/radio-group', () => ({
  RadioGroupItem: ({ value, id, disabled, className }: any) =>
    React.createElement('input', {
      type: 'radio',
      value,
      id,
      disabled,
      className,
      'data-testid': 'radio-item',
      name: 'offer-group',
    }),
}))

vi.mock('@oasisprotocol/ui-library/src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => React.createElement('div', { className, 'data-testid': 'skeleton' }),
}))

vi.mock('@oasisprotocol/ui-library/src/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock hooks
vi.mock('../../hooks/useTicker', () => ({
  useTicker: vi.fn(() => 'ROSE'),
}))

vi.mock('../../coin-gecko/api', () => ({
  useGetRosePrice: vi.fn(),
}))

// Import the mocked function
import { useGetRosePrice as useGetRosePriceMock } from '../../coin-gecko/api'

// Set default mock return value
useGetRosePriceMock.mockReturnValue({
  data: 0.05,
  isLoading: false,
  isFetched: true,
})

vi.mock('../../hooks/useNetwork', () => ({
  useNetwork: vi.fn(() => 'mainnet'),
}))

// Mock MachineResources component
vi.mock('../MachineResources', () => ({
  MachineResources: ({ cpus, memory, storage }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'machine-resources' },
      `CPUs: ${cpus}, Memory: ${memory}, Storage: ${storage}`,
    ),
}))

// Mock @oasisprotocol/client-rt
vi.mock('@oasisprotocol/client-rt', () => ({
  types: {
    RoflmarketTerm: {
      HOUR: 1,
      MONTH: 2,
      YEAR: 3,
    },
    RoflmarketTeeType: {
      NO_TEE: 0,
      INTEL_SGX: 1,
    },
  },
}))

describe('BuildStepOffers Component', () => {
  let queryClient: QueryClient

  // Helper function to create mock offer
  const createMockOffer = (overrides?: Partial<RoflMarketOffer>): RoflMarketOffer => ({
    id: 'offer-123',
    provider: 'oasis1_provider',
    resources: {
      cpus: 2,
      memory: 4096,
      storage: 10240,
      tee: oasisRT.types.RoflmarketTeeType.NO_TEE,
    },
    payment: {
      native: {
        terms: {
          [oasisRT.types.RoflmarketTerm.HOUR]: '1000000000000000000', // 1 ROSE per hour
          [oasisRT.types.RoflmarketTerm.MONTH]: '720000000000000000000', // 720 ROSE per month (30 days * 24 hours)
        },
      },
    },
    capacity: 10,
    metadata: {
      'net.oasis.scheduler.offer': 'Premium Offer',
    },
    removed: false,
    ...overrides,
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render offer with metadata name', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('Premium Offer')).toBeInTheDocument()
    })

    it('should render offer ID as fallback when metadata name is missing', () => {
      const offer = createMockOffer({
        metadata: {},
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('offer-123')).toBeInTheDocument()
    })

    it('should render machine resources', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByTestId('machine-resources')).toBeInTheDocument()
      expect(screen.getByText(/CPUs: 2/)).toBeInTheDocument()
      expect(screen.getByText(/Memory: 4096/)).toBeInTheDocument()
      expect(screen.getByText(/Storage: 10240/)).toBeInTheDocument()
    })

    it('should render radio input element', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      const radio = screen.getByTestId('radio-item')
      expect(radio).toBeInTheDocument()
      expect(radio).toHaveAttribute('type', 'radio')
      expect(radio).toHaveAttribute('value', 'offer-123')
      expect(radio).toHaveAttribute('id', 'offer-123')
    })
  })

  describe('pricing display', () => {
    it('should display cost in ROSE for hours duration', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE per hour * 1 hour = 1 ROSE
      expect(screen.getByText(/1 ROSE/)).toBeInTheDocument()
    })

    it('should display cost in ROSE for days duration', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="days"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE per hour * 24 hours (1 day) = 24 ROSE
      expect(screen.getByText(/24 ROSE/)).toBeInTheDocument()
    })

    it('should display cost in ROSE for months duration', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="months"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 720 ROSE per month * 1 month = 720 ROSE
      expect(screen.getByText(/720 ROSE/)).toBeInTheDocument()
    })

    it('should multiply cost by multiplyNumber', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={5}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE per hour * 5 hours = 5 ROSE
      expect(screen.getByText(/5 ROSE/)).toBeInTheDocument()
    })

    it('should display USD conversion when price is available', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE * $0.05 = $0.05
      expect(screen.getByText(/\$0.05/)).toBeInTheDocument()
    })

    it('should display skeleton when loading price', () => {
      useGetRosePriceMock.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetched: false,
      })

      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()

      // Restore original mock
      useGetRosePriceMock.mockReturnValue({
        data: 0.05,
        isLoading: false,
        isFetched: true,
      })
    })

    it('should not fetch price on testnet', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="testnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(useGetRosePriceMock).toHaveBeenCalledWith({ enabled: false })
    })

    it('should fetch price on mainnet', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(useGetRosePriceMock).toHaveBeenCalledWith({ enabled: true })
    })
  })

  describe('invalid input handling', () => {
    it('should display dash when multiplyNumber is not positive', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={0}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should display dash when multiplyNumber is negative', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={-1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should display dash when multiplyNumber is not an integer', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1.5}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should display dash when offer has no payment terms', () => {
      const offer = createMockOffer({
        payment: {},
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should display dash when calculated cost is zero', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '0',
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  describe('cost calculation callback', () => {
    it('should call onCostCalculated when input is valid and offer is selected', () => {
      const onCostCalculated = vi.fn()
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // Should be called with 1 ROSE in base units (18 decimals)
      expect(onCostCalculated).toHaveBeenCalledWith('1000000000000000000')
    })

    it('should not call onCostCalculated when offer is not selected', () => {
      const onCostCalculated = vi.fn()
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="different-offer"
          duration="hours"
          multiplyNumber={1}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(onCostCalculated).not.toHaveBeenCalled()
    })

    it('should not call onCostCalculated when input is invalid', () => {
      const onCostCalculated = vi.fn()
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={0}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(onCostCalculated).not.toHaveBeenCalled()
    })

    it('should calculate cost correctly for multiple hours', () => {
      const onCostCalculated = vi.fn()
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={10}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE per hour * 10 hours = 10 ROSE in base units
      expect(onCostCalculated).toHaveBeenCalledWith('10000000000000000000')
    })

    it('should calculate cost correctly for days (24x multiplier)', () => {
      const onCostCalculated = vi.fn()
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="days"
          multiplyNumber={2}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE per hour * 48 hours (2 days * 24) = 48 ROSE in base units
      expect(onCostCalculated).toHaveBeenCalledWith('48000000000000000000')
    })

    it('should calculate cost correctly for months using month term', () => {
      const onCostCalculated = vi.fn()
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="months"
          multiplyNumber={3}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 720 ROSE per month * 3 months = 2160 ROSE in base units
      expect(onCostCalculated).toHaveBeenCalledWith('2160000000000000000000')
    })
  })

  describe('disabled state', () => {
    it('should render disabled radio when disabled prop is true', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={true}
        />,
        { wrapper },
      )

      const radio = screen.getByTestId('radio-item')
      expect(radio).toBeDisabled()
    })

    it('should render enabled radio when disabled prop is false', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      const radio = screen.getByTestId('radio-item')
      expect(radio).not.toBeDisabled()
    })
  })

  describe('label interaction', () => {
    it('should render label associated with radio input', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      const label = screen.getByTestId('label')
      const radio = screen.getByTestId('radio-item')

      expect(label).toHaveAttribute('for', 'offer-123')
      expect(radio).toHaveAttribute('id', 'offer-123')
    })

    it('should apply selected styling when offer matches fieldValue', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      const label = screen.getByTestId('label')
      expect(label.className).toContain('bg-card')
      expect(label.className).toContain('border-primary')
    })

    it('should apply default styling when offer does not match fieldValue', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="different-offer"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      const label = screen.getByTestId('label')
      expect(label.className).toContain('border-border')
    })
  })

  describe('edge cases', () => {
    it('should handle offer with empty metadata', () => {
      const offer = createMockOffer({
        metadata: {},
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('offer-123')).toBeInTheDocument()
    })

    it('should handle offer with missing terms for selected duration', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '1000000000000000000',
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="months"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // Should show dash since month term is missing
      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should handle very large multiplyNumber', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={8760}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE * 8760 hours = 8760 ROSE
      expect(screen.getByText(/8760 ROSE/)).toBeInTheDocument()
    })

    it('should handle missing payment.native', () => {
      const offer = createMockOffer({
        payment: {},
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should handle offer with undefined onCostCalculated', () => {
      const offer = createMockOffer()

      expect(() => {
        render(
          <BuildStepOffers
            offer={offer}
            fieldValue="offer-123"
            duration="hours"
            multiplyNumber={1}
            network="mainnet"
            disabled={false}
          />,
          { wrapper },
        )
      }).not.toThrow()
    })
  })

  describe('resource display variations', () => {
    it('should display different CPU counts', () => {
      const offer1 = createMockOffer({ resources: { cpus: 1, memory: 2048, storage: 5120, tee: 0 } })
      const offer4 = createMockOffer({ resources: { cpus: 4, memory: 4096, storage: 10240, tee: 0 } })

      const { rerender } = render(
        <BuildStepOffers
          offer={offer1}
          fieldValue="offer-1"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText(/CPUs: 1/)).toBeInTheDocument()

      rerender(
        <BuildStepOffers
          offer={offer4}
          fieldValue="offer-4"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
      )

      expect(screen.getByText(/CPUs: 4/)).toBeInTheDocument()
    })

    it('should display different memory amounts', () => {
      const offer = createMockOffer({ resources: { cpus: 2, memory: 8192, storage: 10240, tee: 0 } })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText(/Memory: 8192/)).toBeInTheDocument()
    })

    it('should display different storage amounts', () => {
      const offer = createMockOffer({ resources: { cpus: 2, memory: 4096, storage: 20480, tee: 0 } })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText(/Storage: 20480/)).toBeInTheDocument()
    })
  })

  describe('number utilities integration', () => {
    it('should handle fromBaseUnits with various decimal values', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '50000000000000000', // 0.05 ROSE
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText(/0.05 ROSE/)).toBeInTheDocument()
    })

    it('should handle multiplyBaseUnits with large multipliers', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1000}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE * 1000 = 1000 ROSE
      expect(screen.getByText(/1000 ROSE/)).toBeInTheDocument()
    })

    it('should handle decimal ROSE values', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '1500000000000000000', // 1.5 ROSE
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={2}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1.5 ROSE * 2 = 3 ROSE
      expect(screen.getByText(/3 ROSE/)).toBeInTheDocument()
    })
  })

  describe('price calculation edge cases', () => {
    it('should handle very small ROSE prices', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '1000000000000000', // 0.001 ROSE
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText(/0.001 ROSE/)).toBeInTheDocument()
    })

    it('should handle very large ROSE prices', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '1000000000000000000000000', // 1 billion ROSE
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // BigNumber will format large numbers, just check that ROSE is displayed
      expect(screen.getByText(/ROSE/)).toBeInTheDocument()
    })

    it('should handle zero ROSE price from terms', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '0',
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  describe('USD conversion edge cases', () => {
    it('should handle very small USD prices', () => {
      useGetRosePriceMock.mockReturnValue({
        data: 0.0001,
        isLoading: false,
        isFetched: true,
      })

      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '1000000000000000000', // 1 ROSE
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 1 ROSE * $0.0001 = $0.0001
      expect(screen.getByText(/\$0.00/)).toBeInTheDocument()

      // Restore original mock
      useGetRosePriceMock.mockReturnValue({
        data: 0.05,
        isLoading: false,
        isFetched: true,
      })
    })

    it('should handle very large USD prices', () => {
      useGetRosePriceMock.mockReturnValue({
        data: 1000,
        isLoading: false,
        isFetched: true,
      })

      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '10000000000000000000', // 10 ROSE
            },
          },
        },
      })

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 10 ROSE * $1000 = $10,000
      expect(screen.getByText(/\$10,000.00/)).toBeInTheDocument()

      // Restore original mock
      useGetRosePriceMock.mockReturnValue({
        data: 0.05,
        isLoading: false,
        isFetched: true,
      })
    })

    it('should handle undefined rosePrice', () => {
      useGetRosePriceMock.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetched: true,
      })

      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // Should show ROSE price but not USD
      expect(screen.getByText(/1 ROSE/)).toBeInTheDocument()
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument()

      // Restore original mock
      useGetRosePriceMock.mockReturnValue({
        data: 0.05,
        isLoading: false,
        isFetched: true,
      })
    })
  })

  describe('network behavior', () => {
    it('should not call useGetRosePrice on testnet', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="testnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(useGetRosePriceMock).toHaveBeenCalledWith({ enabled: false })
    })

    it('should call useGetRosePrice with enabled true on mainnet', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      expect(useGetRosePriceMock).toHaveBeenCalledWith({ enabled: true })
    })
  })

  describe('interaction and state', () => {
    it('should throw when onCostCalculated callback throws an error', () => {
      const onCostCalculated = vi.fn(() => {
        throw new Error('Callback error')
      })
      const offer = createMockOffer()

      // The component does not catch callback errors - they propagate
      expect(() => {
        render(
          <BuildStepOffers
            offer={offer}
            fieldValue="offer-123"
            duration="hours"
            multiplyNumber={1}
            onCostCalculated={onCostCalculated}
            network="mainnet"
            disabled={false}
          />,
          { wrapper },
        )
      }).toThrow('Callback error')
    })

    it('should handle multiplyNumber as a string that converts to a number', () => {
      const offer = createMockOffer()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={'5' as unknown as number}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // Component should handle the type coercion
      expect(screen.getByTestId('radio-item')).toBeInTheDocument()
    })

    it('should throw when multiplyNumber is NaN', () => {
      const offer = createMockOffer()

      // NaN is not a valid integer and causes multiplyBaseUnits to throw
      expect(() => {
        render(
          <BuildStepOffers
            offer={offer}
            fieldValue="offer-123"
            duration="hours"
            multiplyNumber={NaN}
            network="mainnet"
            disabled={false}
          />,
          { wrapper },
        )
      }).toThrow('Invalid multiplier')
    })
  })

  describe('duration calculation accuracy', () => {
    it('should calculate correct cost for 7 days in hours', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '1000000000000000000', // 1 ROSE per hour
            },
          },
        },
      })

      const onCostCalculated = vi.fn()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="days"
          multiplyNumber={7}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 7 days * 24 hours * 1 ROSE = 168 ROSE in base units
      expect(onCostCalculated).toHaveBeenCalledWith('168000000000000000000')
    })

    it('should calculate correct cost for 30 days in hours', () => {
      const offer = createMockOffer({
        payment: {
          native: {
            terms: {
              [oasisRT.types.RoflmarketTerm.HOUR]: '1000000000000000000', // 1 ROSE per hour
            },
          },
        },
      })

      const onCostCalculated = vi.fn()

      render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="days"
          multiplyNumber={30}
          onCostCalculated={onCostCalculated}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // 30 days * 24 hours * 1 ROSE = 720 ROSE in base units
      expect(onCostCalculated).toHaveBeenCalledWith('720000000000000000000')
    })
  })

  describe('rendering consistency', () => {
    it('should render consistently with the same props', () => {
      const offer = createMockOffer()

      const { rerender } = render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      const firstRender = screen.getByTestId('label').className

      rerender(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
      )

      const secondRender = screen.getByTestId('label').className

      expect(firstRender).toBe(secondRender)
    })

    it('should handle rapid prop changes without errors', () => {
      const offer = createMockOffer()

      const { rerender } = render(
        <BuildStepOffers
          offer={offer}
          fieldValue="offer-123"
          duration="hours"
          multiplyNumber={1}
          network="mainnet"
          disabled={false}
        />,
        { wrapper },
      )

      // Rapidly change multiplyNumber
      expect(() => {
        for (let i = 1; i <= 100; i++) {
          rerender(
            <BuildStepOffers
              offer={offer}
              fieldValue="offer-123"
              duration="hours"
              multiplyNumber={i}
              network="mainnet"
              disabled={false}
            />,
          )
        }
      }).not.toThrow()
    })
  })
})
